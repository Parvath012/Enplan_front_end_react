import {
  AUTHENTICATE,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_FAILURE,
  FETCH_USERS,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
} from "../Actions/templateAction";

export interface ITemplates {
  jwtToken: string | null;
  users: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ITemplates = {
  jwtToken: null,
  users: [],
  loading: false,
  error: null,
};

const TemplateReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case AUTHENTICATE:
      return { ...state, loading: true, error: null };
    case AUTHENTICATE_SUCCESS:
      return { ...state, loading: false, jwtToken: action.payload };
    case AUTHENTICATE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_USERS:
      return { ...state, loading: true, error: null };
    case FETCH_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };
    case FETCH_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default: {
      return state;
    }
  }
};

export default TemplateReducer;
