import store from "../store/configureStore";

export const getJwtToken = () => {
  const state = store.getState();
  console.log("Redux state in adminApp:", state);
  return state.template?.jwtToken;
};