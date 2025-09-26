"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchUsers, addUser, updateUser, deleteUser } from "@/services/user.services"
import { User } from "@/types/data-type";
import {useAxios} from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";

const UserContext = createContext<any | null>(null);




export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState([]);
  const axiosInstance = useAxios();
  const getAuthHeaders = useAuthHeaders();

  const loadUsers = async () => {
    const data = await fetchUsers(axiosInstance, getAuthHeaders);
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (user: User) => {
    await addUser(axiosInstance, user, getAuthHeaders);
    loadUsers();
  };

  const editUser = async (id: string, user: User) => {
    await updateUser(axiosInstance, id, user, getAuthHeaders);
    loadUsers();
  };

  const removeUser = async (id: string) => {
    await deleteUser(axiosInstance, id, getAuthHeaders);
    loadUsers();
  };

  return (
    <UserContext.Provider value={{ users, createUser, editUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
