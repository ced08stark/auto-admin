
"use client";
import { AxiosInstance } from "axios";
import { WrittenQuestion } from "@/types/data-type";



interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}

export const fetchWrittenQuestions = async (
    api: AxiosInstance,
    getAuthHeaders: any
) => {
    try {
        console.log("fetchWrittenQuestions called");
        const response = await api.get("/api/v1/question/written-questions", getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des question", error);
        throw error;
    }
};

export const addWrittenQuestion = async (api: AxiosInstance, question: WrittenQuestion, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const response = await api.post("/api/v1/question/written-questions", question,  getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const updateWrittenQuestion = async (api: AxiosInstance, id: string, question: Partial<WrittenQuestion>, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const { headers } =  getAuthHeaders();
        const response = await api.put(`/api/v1/question/written-questions/${id}`, question, { headers });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};

export const deleteWrittenQuestion = async (api: AxiosInstance, id: string, getAuthHeaders: FetchWrittenQuestionsParams["getAuthHeaders"]) => {
    try {
        const { headers } =  getAuthHeaders();
        await api.delete(`/api/v1/question/written-questions/${id}`, { headers });
    } catch (error) {
        console.error("Erreur lors de la récupération des séries", error);
        throw error;
    }
};
