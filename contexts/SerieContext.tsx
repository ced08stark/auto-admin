"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchSeries, addSerie, deleteSerie, updateSerie  } from "@/services/serie.services";
import { Serie } from "@/types/data-type";
import { useAxios } from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";

const SerieContext = createContext<any | null>(null);


export const SerieProvider = ({ children }: { children: React.ReactNode }) => {
  const [series, setSeries] = useState([]);
  const axiosInstance = useAxios();
  const { getHeaders } = useAuthHeaders();

  const loadSeries = async () => {
    const data = await fetchSeries(axiosInstance, getHeaders);
    console.log("Fetched series:", data);
    setSeries(data.data);
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const createSeries = async (series: Serie) => {
    await addSerie(axiosInstance, series, getHeaders);
    loadSeries();
  };

  const editSeries = async (id: string, permitTypes: Serie) => {
    await updateSerie(axiosInstance, id, permitTypes, getHeaders);
    loadSeries();
  };

  const removeSeries = async (id: string) => {
    await deleteSerie(axiosInstance, id, getHeaders);
    loadSeries();
  };

  return (
    <SerieContext.Provider value={{ series, createSeries, editSeries, removeSeries }}>
      {children}
    </SerieContext.Provider>
  );
};

export const useSerie = () => useContext(SerieContext);
