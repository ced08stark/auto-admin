"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchWrittenQuestions, addWrittenQuestion, updateWrittenQuestion, deleteWrittenQuestion } from "@/services/writtenQuestion.services";
import { WrittenQuestion } from "@/types/data-type";
import { useAxios } from "@/lib/api";
import { useAuthHeaders } from "@/hooks/useAuthHeader";


const WrittenQuestionContext = createContext<any | null>(null);



export const WrittenQuestionProvider = ({ children }: { children: React.ReactNode }) => {
  const [writtenQuestions, setWrittenQuestions] = useState([]);
  const axiosInstance = useAxios();
  const { getHeaders } = useAuthHeaders();
  const loadWrittenQuestions = async () => {
    console.log("Loading Written Questions...");
    const data = await fetchWrittenQuestions(axiosInstance, getHeaders);
    console.log("Fetched Written Questions:", data.data);
    setWrittenQuestions(data.data);
  };

  useEffect(() => {
    loadWrittenQuestions();
    console.log('test' + writtenQuestions)
  }, []);

  const createWrittenQuestion = async (question: WrittenQuestion) => {
    const res = await addWrittenQuestion(axiosInstance, question, getHeaders);
    await loadWrittenQuestions();
    return res; // ✅ retourne la réponse
  };

  const editWrittenQuestion = async (id: string, question: WrittenQuestion) => {
    const res = await updateWrittenQuestion(axiosInstance, id, question, getHeaders);
    await loadWrittenQuestions();
    return res; // ✅ retourne la réponse
  };

  const removeWrittenQuestion = async (id: string) => {
    const res = await deleteWrittenQuestion(axiosInstance, id, getHeaders);
    await loadWrittenQuestions();
    return res; // ✅ retourne la réponse
  };

  return (
    <WrittenQuestionContext.Provider value={{ writtenQuestions, createWrittenQuestion, editWrittenQuestion, removeWrittenQuestion }}>
      {children}
    </WrittenQuestionContext.Provider>
  );
};

export const useWrittenQuestion = () => useContext(WrittenQuestionContext);
