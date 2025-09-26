
"use client";
import { AxiosInstance } from "axios";
import { OralQuestion } from "@/types/data-type";


interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}



export const fetchOralQuestions = async (api: AxiosInstance, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const response = await api.get("/api/v1/question/oral-questions", getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const addOralQuestion = async (api: AxiosInstance, oral: OralQuestion, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const response = await api.post("/api/v1/question/oral-questions", oral, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const updateOralQuestion = async (api: AxiosInstance, id: string, oral: Partial<OralQuestion>, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const { headers } = getAuthHeaders();
        const response = await api.put(`/api/v1/question/oral-questions/${id}`, oral, { headers });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const deleteOralQuestion = async (api: AxiosInstance, id: string, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const { headers } = getAuthHeaders();
        await api.delete(`/api/v1/question/oral-questions/${id}`, { headers });
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};
