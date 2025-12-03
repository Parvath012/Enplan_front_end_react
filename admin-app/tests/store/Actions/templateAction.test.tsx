import {
  authenticate,
  fetchUsers,
  fetchUsers1,
  AUTHENTICATE,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_FAILURE,
  FETCH_USERS,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
} from "../../../src/store/Actions/templateAction";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("templateAction", () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
    getState = jest.fn();
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("dispatches AUTHENTICATE and AUTHENTICATE_SUCCESS on success", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { status: "Success", data: { jwtToken: "token123" } },
      });

      await authenticate()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: AUTHENTICATE });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTHENTICATE_SUCCESS,
        payload: "token123",
      });
    });

    it("dispatches AUTHENTICATE_FAILURE and rejects with Error on error status", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { status: "Error", message: "Invalid credentials" },
      });

      await expect(authenticate()(dispatch)).rejects.toThrow("Invalid credentials");
      expect(dispatch).toHaveBeenCalledWith({ type: AUTHENTICATE });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTHENTICATE_FAILURE,
        payload: "Invalid credentials",
      });
    });

    it("dispatches AUTHENTICATE_FAILURE and rejects on axios error", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

      await expect(authenticate()(dispatch)).rejects.toThrow("Network error");
      expect(dispatch).toHaveBeenCalledWith({ type: AUTHENTICATE });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTHENTICATE_FAILURE,
        payload: "Network error",
      });
    });

    it("handles non-Error thrown in catch", async () => {
      // @ts-ignore
      mockedAxios.post.mockRejectedValueOnce({ message: "Weird error" });

      await expect(authenticate()(dispatch)).rejects.toThrow("Weird error");
      expect(dispatch).toHaveBeenCalledWith({ type: AUTHENTICATE });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTHENTICATE_FAILURE,
        payload: "Weird error",
      });
    });

    it("handles thrown string in catch (not an Error instance)", async () => {
      // @ts-ignore
      mockedAxios.post.mockRejectedValueOnce("string error");
      await expect(authenticate()(dispatch)).rejects.toThrow("string error");
      expect(dispatch).toHaveBeenCalledWith({ type: AUTHENTICATE });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTHENTICATE_FAILURE,
        payload: "string error",
      });
    });

    it("handles thrown object without message in catch", async () => {
      // @ts-ignore
      mockedAxios.post.mockRejectedValueOnce({ foo: "bar" });
      await expect(authenticate()(dispatch)).rejects.toThrow("[object Object]");
      expect(dispatch).toHaveBeenCalledWith({ type: AUTHENTICATE });
      expect(dispatch).toHaveBeenCalledWith({
        type: AUTHENTICATE_FAILURE,
        payload: "[object Object]",
      });
    });
  });

  describe("fetchUsers1", () => {
    it("dispatches FETCH_USERS and FETCH_USERS_SUCCESS on success", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1, name: "User1" }] });

      await fetchUsers1()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: FETCH_USERS });
      expect(dispatch).toHaveBeenCalledWith({
        type: FETCH_USERS_SUCCESS,
        payload: [{ id: 1, name: "User1" }],
      });
    });

    it("dispatches FETCH_USERS_FAILURE on error", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Fetch error"));

      await fetchUsers1()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: FETCH_USERS });
      expect(dispatch).toHaveBeenCalledWith({
        type: FETCH_USERS_FAILURE,
        payload: "Fetch error",
      });
    });
  });

  describe("fetchUsers", () => {
    it("dispatches FETCH_USERS and FETCH_USERS_SUCCESS on success", async () => {
      // Mock authenticate to resolve
      dispatch.mockImplementationOnce(() => Promise.resolve());
      getState.mockReturnValue({ template: { jwtToken: "token123" } });
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: [{ id: 2, name: "User2" }] },
      });

      await fetchUsers()(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({ type: FETCH_USERS });
      expect(dispatch).toHaveBeenCalledWith({
        type: FETCH_USERS_SUCCESS,
        payload: [{ id: 2, name: "User2" }],
      });
    });

    it("does not fetch users if authenticate fails", async () => {
      dispatch.mockImplementationOnce(() => Promise.reject(new Error("Auth failed")));
      getState.mockReturnValue({ template: { jwtToken: "token123" } });

      await fetchUsers()(dispatch, getState);

      expect(mockedAxios.post).not.toHaveBeenCalledWith(
        "http://172.16.20.116:50003/api/v1/admin/Users/GetUsers",
        expect.anything(),
        expect.anything()
      );
      expect(dispatch).not.toHaveBeenCalledWith({
        type: FETCH_USERS_SUCCESS,
        payload: expect.anything(),
      });
    });

    it("does not fetch users if jwtToken is missing", async () => {
      dispatch.mockImplementationOnce(() => Promise.resolve());
      getState.mockReturnValue({ template: { jwtToken: undefined } });

      await fetchUsers()(dispatch, getState);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalledWith({
        type: FETCH_USERS_SUCCESS,
        payload: expect.anything(),
      });
    });

    it("dispatches FETCH_USERS_FAILURE if axios fails", async () => {
      dispatch.mockImplementationOnce(() => Promise.resolve());
      getState.mockReturnValue({ template: { jwtToken: "token123" } });
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

      await fetchUsers()(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({ type: FETCH_USERS });
      expect(dispatch).toHaveBeenCalledWith({
        type: FETCH_USERS_FAILURE,
        payload: "Network error",
      });
    });

    it("logs and returns if authenticate throws non-Error", async () => {
      dispatch.mockImplementationOnce(() => Promise.reject("not an error object"));
      getState.mockReturnValue({ template: { jwtToken: "token123" } });

      await fetchUsers()(dispatch, getState);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalledWith({
        type: FETCH_USERS_SUCCESS,
        payload: expect.anything(),
      });
    });

    it("logs and returns if jwtToken is null", async () => {
      dispatch.mockImplementationOnce(() => Promise.resolve());
      getState.mockReturnValue({ template: { jwtToken: null } });

      await fetchUsers()(dispatch, getState);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalledWith({
        type: FETCH_USERS_SUCCESS,
        payload: expect.anything(),
      });
    });
  });
});