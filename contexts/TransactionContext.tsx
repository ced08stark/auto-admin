"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchTransactions, addTransaction, updateTransaction, deleteTransaction } from "@/services/transaction.services";
import { Transaction } from "@/types/data-type";
import { useAxios } from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";

const TransactionContext = createContext<any | null>(null);


export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState([]);
  const axiosInstance = useAxios();
  const getAuthHeaders = useAuthHeaders();

  const loadTransactions = async () => {
    const data = await fetchTransactions(axiosInstance, getAuthHeaders);
    setTransactions(data);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const createTransaction = async (transaction: Transaction) => {
    await addTransaction(axiosInstance, transaction, getAuthHeaders);
    loadTransactions();
  };

  const editTransaction = async (id: string, transaction: Transaction) => {
    await updateTransaction(axiosInstance, id, transaction, getAuthHeaders);
    loadTransactions();
  };

  const removeTransaction = async (id: string) => {
    await deleteTransaction(axiosInstance, id, getAuthHeaders);
    loadTransactions();
  };

  return (
    <TransactionContext.Provider value={{ transactions, createTransaction, editTransaction, removeTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => useContext(TransactionContext);
