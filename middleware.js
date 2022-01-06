
const tokenFetchStarted = () => ({type: 'TOKEN_FETCH_STARTED'})
const tokenFetchSuccess = (payload) => ({type: 'TOKEN_FETCH_SUCCESS', payload, localStorage: 'token'})
const tokenFetchError  = (payload) => ({type: 'TOKEN_FETCH_ERROR', payload })

const userFetchStarted = () => ({type: 'USER_FETCH_STARTED'})
const userFetchSuccess = (payload) => ({type: 'USER_FETCH_SUCCESS', payload})
const userFetchError  = (payload) => ({type: 'USER_FETCH_ERROR', payload })


const getLocalStorage = (key, initial) => {
  try{
    const data = window.localStorage.getItem(key);
    return JSON.parse(data);
  }catch(error){
    return initial;
  }
}

const initialStateToken = {
  loading: false,
  data: getLocalStorage('token',null),
  error: null,
}
const initialStateUser = {
  loading: false,
  data: null,
  error: null,
}

function tokenReducer(state = initialStateToken, action){
  switch(action.type){
    case 'TOKEN_FETCH_STARTED':
      return {...state, loading: true};
    case 'TOKEN_FETCH_SUCCESS':
      return {...state, data: action.payload, loading:false}
    case 'TOKEN_FETCH_ERROR':
      return {...state, error: action.payload, loading: false}
    default:
      return state;
  }
}

function userReducer(state = initialStateUser, action){
  switch(action.type){
    case 'USER_FETCH_STARTED':
      return {...state, loading: true};
    case 'USER_FETCH_SUCCESS':
      return {...state, data: action.payload, loading:false}
    case 'USER_FETCH_ERROR':
      return {...state, error: action.payload, loading: false}
    default:
      return state;
  }
}

const thunk = (store) => (next) => (action) => {
  if(typeof action == 'function')
    action(store.dispatch);
  return next(action);
}

const storage = (store) => (next) => (action) => {
  if(action.localStorage != undefined){
    window.localStorage.setItem(action.localStorage, JSON.stringify(action.payload));
  }

  return next(action);
}

const userFetch = (token) => async (dispatch) => {
  try {
    dispatch(userFetchStarted());
    const response = await fetch('https://dogsapi.origamid.dev/json/api/user', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    const data = await response.json();
    dispatch(userFetchSuccess(data));
  } catch (error) {
    dispatch(userFetchError(error.message));
  }
}

const tokenFetch = (body) => async (dispatch) => {
  try {
    dispatch(tokenFetchStarted());
    const response = await fetch(
      'https://dogsapi.origamid.dev/json/jwt-auth/v1/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    const { token } = await response.json();
    dispatch(tokenFetchSuccess(token));
  } catch (error) {
    dispatch(tokenFetchError(error.message));
  }
}


const reducers = Redux.combineReducers({ tokenReducer, userReducer });
const enhancers = Redux.compose(Redux.applyMiddleware(thunk, storage))
const store = Redux.createStore(reducers, enhancers)

const login = async (user) => {
  let state = store.getState();
  if(!state.tokenReducer.data)
  await store.dispatch(tokenFetch(user))
  
  state = store.getState();
  await store.dispatch(userFetch(state.tokenReducer.data));
}

login({username: 'dog', password: 'dog'});

// console.log(store.getState())