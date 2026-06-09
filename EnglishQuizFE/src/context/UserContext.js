import React, { createContext, useState } from "react";
import axios from "axios";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // GET ALL USERS
  const getAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:9999/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // UPDATE USER
  const updateProfile = async (id, name, email) => {
    try {
      const res = await axios.put(
        `http://localhost:9999/users/${id}`,
        { name, email }
      );

      // update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    users,
    setUsers,
    getAllUsers,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;