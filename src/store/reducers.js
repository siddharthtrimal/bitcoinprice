import * as actionsTypes from './actions'


const initialState = {
    data:{
        currency : "",
        currentRate : "",
        historyData : []
    }
    
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionsTypes.CHANGE_CURRENCY:
      return{
          ...state,
          data : {
              ...action.data
          }
      }
      
    default:
      return state

  }
}

export default reducer