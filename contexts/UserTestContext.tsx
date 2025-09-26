"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchWrittenTests, addWrittenTest, updateWrittenTest, deleteWrittenTest } from "@/services/userTest.services";
import { WrittenTest } from "@/types/data-type";
import {useAxios} from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";

const WrittenTestContext = createContext<any | null>(null);



export const WrittenTestProvider = ({ children }: { children: React.ReactNode }) => {
  const [writtenTests, setWrittenTests] = useState([]);
  const axiosInstance = useAxios();
  const getAuthHeaders = useAuthHeaders();

  const loadWrittenTests = async () => {
    const data = await fetchWrittenTests(axiosInstance, getAuthHeaders);
    setWrittenTests(data);
  };

  useEffect(() => {
    loadWrittenTests();
  }, []);

  const createWrittenTest = async (test: WrittenTest) => {
    await addWrittenTest(axiosInstance, test, getAuthHeaders);
    loadWrittenTests();
  };

  const editWrittenTest = async (id: string, test: WrittenTest) => {
    await updateWrittenTest(axiosInstance, id, test, getAuthHeaders);
    loadWrittenTests();
  };

  const removeWrittenTest = async (id: string) => {
    await deleteWrittenTest(axiosInstance, id, getAuthHeaders);
    loadWrittenTests();
  };

  return (
    <WrittenTestContext.Provider value={{ writtenTests, createWrittenTest, editWrittenTest, removeWrittenTest }}>
      {children}
    </WrittenTestContext.Provider>
  );
};

export const useWrittenTest = () => useContext(WrittenTestContext);
