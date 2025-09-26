
"use client";
import { AxiosInstance } from "axios";
import { Serie } from "@/types/data-type";

interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}


// 🔥 Récupération des séries
export const fetchSeries = async (api: AxiosInstance, getAuthHeaders: any) => {
  try {
    const response = await api.get("/api/v1/serie/series", getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des séries", error);
    throw error;
  }
};

// 🔥 Ajout d’une série
export const addSerie = async (api: AxiosInstance, serie: Serie, getAuthHeaders: any) => {
  try {
    const response = await api.post("/api/v1/serie/series", serie, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la série", error);
    throw error;
  }
};

// 🔥 Mise à jour d’une série
export const updateSerie = async (api: AxiosInstance, id: string, serie: Partial<Serie>, getAuthHeaders: any) => {
  try {
    const { headers } = getAuthHeaders();
    const response = await api.put(`/api/v1/serie/series/${id}`, serie, { headers });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la série", error);
    throw error;
  }
};

// 🔥 Suppression d’une série
export const deleteSerie = async (api: AxiosInstance, id: string , getAuthHeaders: any) => {
  try {
    const { headers } = getAuthHeaders();
    await api.delete(`/api/v1/serie/series/${id}`, { headers });
  } catch (error) {
    console.error("Erreur lors de la suppression de la série", error);
    throw error;
  }
};
