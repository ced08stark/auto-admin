"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchOralQuestions, addOralQuestion, updateOralQuestion, deleteOralQuestion } from "@/services/oralQuestion.services";
import { OralQuestion } from "@/types/data-type";
const OralQuestionContext = createContext<any | null>(null);
import { useAxios } from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";




export const OralQuestionProvider = ({ children }: { children: React.ReactNode }) => {
  const [oralQuestions, setOralQuestions] = useState([]);
  const axiosInstance = useAxios();
  const { getHeaders } = useAuthHeaders();

  const loadOralQuestions = async () => {
    const data = await fetchOralQuestions(axiosInstance, getHeaders);
    console.log(data.data);
    setOralQuestions(data.data);
  };

  useEffect(() => {
    loadOralQuestions();
  }, []);

  const createOralQuestion = async (question: OralQuestion) => {
    await addOralQuestion(axiosInstance, question, getHeaders);
    loadOralQuestions();
  };

  const editOralQuestion = async (id: string, question: OralQuestion) => {
    await updateOralQuestion(axiosInstance, id, question, getHeaders);
    loadOralQuestions();
  };

  const removeOralQuestion = async (id: string) => {
    await deleteOralQuestion(axiosInstance, id, getHeaders);
    loadOralQuestions();
  };

  return (
    <OralQuestionContext.Provider value={{ oralQuestions, createOralQuestion, editOralQuestion, removeOralQuestion }}>
      {children}
    </OralQuestionContext.Provider>
  );
};

export const useOralQuestion = () => useContext(OralQuestionContext);
