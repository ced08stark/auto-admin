
"use client";
import { AxiosInstance } from "axios";
import { Transaction } from "@/types/data-type";


interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}



export const fetchTransactions = async (api: AxiosInstance, getAuthHeaders: any) => {
    try {
        const response = await api.get("/api/v1/transacction/transactions", await getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const addTransaction = async (api: AxiosInstance, transaction: Transaction, getAuthHeaders: any) => {
    try {
        const response = await api.post("/api/v1/transacction/transactions", transaction, await getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const updateTransaction = async (api: AxiosInstance, id: string, transaction: Partial<Transaction>, getAuthHeaders: any) => {
    try {
        const { headers } = await getAuthHeaders();
        const response = await api.put(`/api/v1/transacction/transactions/${id}`, transaction, { headers });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const deleteTransaction = async (api: AxiosInstance, id: string, getAuthHeaders: any) => {
    try {
        const { headers } = await getAuthHeaders();
        await api.delete(`/api/api/v1/transacction/${id}`, { headers });
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};
