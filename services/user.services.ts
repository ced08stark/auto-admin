"use client";
import { AxiosInstance } from "axios";
import { User } from "@/types/data-type";

interface FetchWrittenQuestionsParams {
    api: AxiosInstance;
    getAuthHeaders: any;
}


// 🔥 Récupération des utilisateurs
export const fetchUsers = async (api: AxiosInstance, getAuthHeaders: any) => {
  try {
    const response = await api.get("/api/v1/user/users",  getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs", error);
    throw error;
  }
};

// 🔥 Ajout d’un utilisateur
export const addUser = async (api: AxiosInstance, user: User, getAuthHeaders: any) => {
  try {
    const response = await api.post("/api/v1/user/users", user, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur", error);
    throw error;
  }
};

// 🔥 Mise à jour d’un utilisateur
export const updateUser = async (api: AxiosInstance, id: string, user: Partial<User>, getAuthHeaders: any) => {
  try {
    const { headers } = getAuthHeaders();
    const response = await api.put(`/api/v1/user/users/${id}`, user, { headers });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur", error);
    throw error;
  }
};

// 🔥 Suppression d’un utilisateur
export const deleteUser = async (api: AxiosInstance, id: string, getAuthHeaders: any) => {
  try {
    const { headers } = await getAuthHeaders();
    await api.delete(`/api/v1/user/users/${id}`, { headers });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur", error);
    throw error;
  }
};
