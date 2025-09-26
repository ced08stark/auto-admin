"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchPermitTypes, addPermitTypes, updatePermitTypes, deletePermitTypes } from "@/services/permitType.services";
import { PermitType } from "@/types/data-type";
import { useAxios } from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";

const PermitTypeContext = createContext<any | null>(null);


export const PermitTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [permitTypes, setPermitTypes] = useState([]);
  const axiosInstance = useAxios();
  const { getHeaders } = useAuthHeaders();

  const loadPermitTypes = async () => {
    const data = await fetchPermitTypes(axiosInstance, getHeaders);
    console.log(data.data);
    setPermitTypes(data.data);
  };

  useEffect(() => {
    loadPermitTypes();
  }, []);

  const createPermitTypes = async (permitTypes: PermitType) => {
    await addPermitTypes(axiosInstance, permitTypes, getHeaders);
    loadPermitTypes();
  };

  const editPermitTypes = async (id: string, permitTypes: PermitType) => {
    await updatePermitTypes(axiosInstance, id, permitTypes, getHeaders);
    loadPermitTypes();
  };

  const removePermitTypes = async (id: string) => {
    await deletePermitTypes(axiosInstance, id, getHeaders);
    loadPermitTypes();
  };

  return (
    <PermitTypeContext.Provider value={{ permitTypes, createPermitTypes, editPermitTypes, removePermitTypes }}>
      {children}
    </PermitTypeContext.Provider>
  );
};

export const usePermitType = () => useContext(PermitTypeContext);
