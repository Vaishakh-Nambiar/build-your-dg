import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  return (
    <ErrorBoundary>
      <LandingPage />
    </ErrorBoundary>
  );
}
