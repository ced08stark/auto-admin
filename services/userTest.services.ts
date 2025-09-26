
"use client";
import { AxiosInstance } from "axios";
import { WrittenTest } from "@/types/data-type";

interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}



export const fetchWrittenTests = async (api: AxiosInstance, getAuthHeaders: any) => {
    try {
        const response = await api.get("/api/v1/test/written-tests", await getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const addWrittenTest = async (api: AxiosInstance, test: WrittenTest, getAuthHeaders: any) => {
    try {
        const response = await api.post("/api/v1/test/written-tests", test, await getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const updateWrittenTest = async (api: AxiosInstance, id: string, test: Partial<WrittenTest>, getAuthHeaders: any) => {
    try {
        const { headers } = await getAuthHeaders();
        const response = await api.put(`/api/v1/test/written-tests/${id}`, test, { headers });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const deleteWrittenTest = async (api: AxiosInstance, id: string, getAuthHeaders: any) => {
    try {
        const { headers } = await getAuthHeaders();
        await api.delete(`/api/written-tests/${id}`, { headers });
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};
