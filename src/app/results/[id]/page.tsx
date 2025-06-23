import SavedResultsPage from '@/components/SavedResultsPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  return <SavedResultsPage resultId={id} />;
}
