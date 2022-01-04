function reducer(state = 1, action){
  switch(action.type){
    case 'SUM':
      return state + 1;
    case 'SUB':
      return state - 1;
    default:
      return state;
  }
}

const logger = (store) => (next) => (action) => {
  console.log(action);
  return next(action);
}

const middleware = Redux.applyMiddleware(logger);

const store = Redux.createStore(reducer, middleware)

console.log(store.getState())

store.dispatch({type: 'SUM'})