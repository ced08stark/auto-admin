"use client";

import { useOralQuestion } from "@/contexts/OralQuestionContext";
import { notFound } from 'next/navigation';
import OralQuestionForm from './oralQuestion-form';
import { OralQuestion } from "@/types/data-type";

type TQuestionViewPageProps = {
  questionId: string;
};

export default function OralQuestionViewPage({
  questionId
}: TQuestionViewPageProps) {
  const { oralQuestions } = useOralQuestion();
  let question = null;
  let pageTitle = 'Create New Oral Question';

  if (questionId !== 'new') {
    const data: OralQuestion = oralQuestions.find((q: OralQuestion) => q._id === questionId);
    question = data as OralQuestion;
    if (!question) {
      notFound();
    }
    pageTitle = `Edit Oral Question`;
  }

  return <OralQuestionForm initialData={question} pageTitle={pageTitle} />;
}
