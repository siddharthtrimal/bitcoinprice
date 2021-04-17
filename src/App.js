import React from 'react';
import './App.css';
import axios from 'axios';
import {connect} from 'react-redux'
import * as actionsTypes from './store/actions'

import * as ChartJs from 'chart.js';

ChartJs.Chart.register.apply(null, Object.values(ChartJs).filter((chartClass) => (chartClass.id)));

var myChart = null




const currencies = [
  {
    title : "United State Dollar",
    field : "USD"
  },
  {
    title : "British Pound Sterling",
    field : "GBP"
  },
  {
    title : "Euro",
    field : "EUR"
  }
]



class App extends React.Component {

  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  componentDidMount(){
    this.changeCurrency(currencies[0].field);
  }

  componentDidUpdate(){
    
    if(this.props.result && this.props.result.historyData ) this.updateChart();
  }

  changeCurrency = (value) =>{

    const end = new Date().toISOString().slice(0,10);

    const start = new Date( new Date().getTime() - (24*60*60*60*1000)).toISOString().slice(0,10);

    const url =  "https://api.coindesk.com/v1/bpi/historical/close.json?currency=EUR&start="+start+"&end="+end;

    try {

      const promise1 = axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
  
      const promise2 = axios.get(url);
  
      Promise.all([promise1, promise2]).then((values) => {
        const result = {
          currency : value,
          currentRate : values[0].data.bpi[`${value}`].rate + " " +values[0].data.bpi[`${value}`].description,
          historyData : values[1].data.bpi
        }
        this.props.onCurrencyChange(result);
      })
      .catch(error=> alert("Failed To Load, Please Reload") )
    }
    catch(err) {
      return alert("Failed To Load, Please Reload")
    }

  }


  updateChart=()=>{

    if(myChart){
      myChart.destroy();
      myChart.destroy();
    } 
    
    const labelData = [];
    const dataArr = []
    if(this.props.result && this.props.result.historyData){
      const requiredData = this.props.result.historyData
      for( const key in requiredData){
        labelData.push(new Date(key).toGMTString().slice(5,11));
        dataArr.push( requiredData[key])
      }
    }

    const myChartRef = this.chartRef.current.getContext("2d");

    myChart = new ChartJs.Chart(myChartRef, {
      type: 'line',
      data: {
        labels: [...labelData],
        datasets: [{ 
            label : "Last 60 days trend",
            data: [...dataArr],
            borderColor: "#3e95cd",
            fill: true,
            pointRadius : 0
          }
        ]
      },
      options: {
        plugins: {
          tooltip: {
          }
        }
      }
    });

  }
  
  render(){
    
    return (
      <div className="App">
        <div className="Container">
          <div className="DataDiv">
            <p>{"1 Bitcoin Equals"}</p>
            <form>
              <select className="DropdownButton"  onChange={(e)=> this.changeCurrency(e.target.value)} name="currencies">
                {
                  currencies.map(ele=>{
                    return(
                      <option key={ele.field} value={ele.field}>{ele.title}</option>
                    )
                  })
                }
              </select>
            </form>
            <h1>{this.props.result && this.props.result.currentRate }</h1>
          </div>
          <div>
            {
              this.props.result.historyData && (
                <canvas
                  id="myChart"
                  ref={this.chartRef}/>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return {
    result: state.data
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCurrencyChange : (result) => dispatch({type: actionsTypes.CHANGE_CURRENCY, data: result})
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(App);
