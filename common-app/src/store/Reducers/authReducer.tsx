import { SET_TOKEN, GET_TOKEN } from "../Actions/authActions";



export interface IAuth {
  token: string | null;
}

const initialState: IAuth = {
  token: null,
};

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_TOKEN:
      return { ...state, token: action.payload };
    case GET_TOKEN:
      return { ...state }
    default:
      return state;
  }
};

export default authReducer;
