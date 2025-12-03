import React from "react";
import { fetchUsers } from "../../store/Actions/templateAction";
import UserTable from "./UserTable";
// test1
const Users = () => {
  return <UserTable fetchAction={fetchUsers} />;
};

export default Users;
