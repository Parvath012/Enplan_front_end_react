import TemplateReducer, { ITemplates } from "../../../src/store/Reducers/templateReducer";
import {
  AUTHENTICATE,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_FAILURE,
  FETCH_USERS,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
} from "../../../src/store/Actions/templateAction";

describe("TemplateReducer", () => {
  const initialState: ITemplates = {
    jwtToken: null,
    users: [],
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(TemplateReducer(undefined, {} as any)).toEqual(initialState);
  });

  it("should handle AUTHENTICATE", () => {
    const action = { type: AUTHENTICATE };
    expect(TemplateReducer(initialState, action)).toEqual({
      ...initialState,
      loading: true,
      error: null,
    });
  });

  it("should handle AUTHENTICATE_SUCCESS", () => {
    const action = { type: AUTHENTICATE_SUCCESS, payload: "token123" };
    expect(TemplateReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      jwtToken: "token123",
    });
  });

  it("should handle AUTHENTICATE_FAILURE", () => {
    const action = { type: AUTHENTICATE_FAILURE, payload: "error" };
    expect(TemplateReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      error: "error",
    });
  });

  it("should handle FETCH_USERS", () => {
    const action = { type: FETCH_USERS };
    expect(TemplateReducer(initialState, action)).toEqual({
      ...initialState,
      loading: true,
      error: null,
    });
  });

  it("should handle FETCH_USERS_SUCCESS", () => {
    const users = [{ id: 1, name: "User" }];
    const action = { type: FETCH_USERS_SUCCESS, payload: users };
    expect(TemplateReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      users,
    });
  });

  it("should handle FETCH_USERS_FAILURE", () => {
    const action = { type: FETCH_USERS_FAILURE, payload: "fetch error" };
    expect(TemplateReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      error: "fetch error",
    });
  });
});