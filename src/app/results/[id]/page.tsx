import SavedResultsPage from '@/components/SavedResultsPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ResultPage({ params }: PageProps) {
  return <SavedResultsPage resultId={params.id} />;
}
