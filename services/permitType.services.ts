
"use client";
import { AxiosInstance } from "axios";
import { PermitType } from "@/types/data-type";

interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}


// 🔥 Récupération des PermitTypes
export const fetchPermitTypes = async (api: AxiosInstance, getAuthHeaders: any) => {
  try {
    const response = await api.get("/api/v1/permit/permit-types",  getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du permit", error);
    throw error;
  }
};

// 🔥 Ajout d’une PermitTypes
export const addPermitTypes = async (api: AxiosInstance, permitType: PermitType, getAuthHeaders: any) => {
  try {
    const response = await api.post("/api/v1/permit/permit-types", permitType,  getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du permit", error);
    throw error;
  }
};

// 🔥 Mise à jour d’une PermitTypes
export const updatePermitTypes = async (api: AxiosInstance, id: string, permitType: Partial<PermitType>, getAuthHeaders: any) => {
  try {
    const { headers } = await getAuthHeaders();
    const response = await api.put(`/api/v1/permit/permit-types/${id}`, permitType, { headers });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du permit", error);
    throw error;
  }
};

// 🔥 Suppression d’une PermitTypes
export const deletePermitTypes = async (api: AxiosInstance, id: string , getAuthHeaders: any) => {
  try {
    const { headers } = await getAuthHeaders();
    await api.delete(`/api/v1/permit/permit-types/${id}`, { headers });
  } catch (error) {
    console.error("Erreur lors de la suppression du permit", error);
    throw error;
  }
};
