import GardenBuilder from "@/components/GardenBuilder";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <GardenBuilder />
      </main>
    </ErrorBoundary>
  );
}
