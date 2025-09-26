"use client";
import { useAuth } from "@clerk/nextjs";

export const useAuthHeaders = () => {
  const { getToken } = useAuth();

  const getHeaders = async () => {
    const token = await getToken();
    console.log("Retrieved token:", token);
    if (!token) throw new Error("Utilisateur non authentifié.");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  return { getHeaders };
};