"use client";
import { useWrittenQuestion } from "@/contexts/WrittenQuestionContext";
import { notFound } from 'next/navigation';
import WrittenQuestionForm from './writtenQuestion-form';
import { WrittenQuestion } from "@/types/data-type";

type TQuestionViewPageProps = {
  questionId: string;
};

export default function WrittenQuestionViewPage({
  questionId
}: TQuestionViewPageProps) {
  const { writtenQuestions } = useWrittenQuestion();
  let question = null;
  let pageTitle = 'Create New Written Question';

  if (questionId !== 'new') {
    const data: WrittenQuestion = writtenQuestions.find((q: WrittenQuestion) => q._id === questionId);
    question = data as WrittenQuestion;
    if (!question) {
      notFound();
    }
    pageTitle = `Edit Written Question`;
  }

  return <WrittenQuestionForm initialData={question} pageTitle={pageTitle} />;
}
