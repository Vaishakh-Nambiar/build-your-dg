import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PublicGardenView } from "@/components/PublicGardenView";

interface PublicGardenPageProps {
  params: {
    username: string;
  };
}

export default function PublicGardenPage({ params }: PublicGardenPageProps) {
  return (
    <ErrorBoundary>
      <PublicGardenView username={params.username} />
    </ErrorBoundary>
  );
}