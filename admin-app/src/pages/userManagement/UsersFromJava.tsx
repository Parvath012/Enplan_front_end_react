import React from "react";
import { fetchUsers1 } from "../../store/Actions/templateAction";
import UserTable from "./UserTable";

const UsersFromJava = () => {
  return <UserTable fetchAction={fetchUsers1} />;
};

export default UsersFromJava;
