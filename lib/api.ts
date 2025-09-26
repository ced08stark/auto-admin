"use client";
import axios from "axios";
import https from "https";
import { useAuth } from "@clerk/nextjs";

const keepAliveAgent = new https.Agent({ keepAlive: true });

export const useAxios = () => {
  const { getToken } = useAuth();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
    httpsAgent: keepAliveAgent,
  });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};
