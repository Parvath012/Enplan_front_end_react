import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/configureStore";

interface UserTableProps {
  fetchAction: () => any; // ThunkAction or any async action
}

const UserTable: React.FC<UserTableProps> = ({ fetchAction }) => {
  const dispatch: AppDispatch = useDispatch();
  const { users, loading, error } = useSelector((state: any) => state.template);

  useEffect(() => {
    dispatch(fetchAction());
  }, [dispatch, fetchAction]);

  return (
    <div>
      <h1>Users</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", border: 1 }}>
        <thead>
          <tr>
            <th>Login ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Is Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td>{user.loginId}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.emailId ?? "N/A"}</td>
              <td>{user.phoneNumber ?? "N/A"}</td>
              <td>{user.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
