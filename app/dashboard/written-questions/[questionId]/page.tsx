import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import QuestionViewPage from '@/features/writtenQuestions/components/writtenQuestion-view-page';

export const metadata = {
  title: 'Dashboard : Question View'
};

type PageProps = { params: Promise<{ questionId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <QuestionViewPage questionId={params.questionId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
