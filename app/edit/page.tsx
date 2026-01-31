import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import GardenBuilder from "@/components/GardenBuilder";

export default function Edit() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <main>
          <GardenBuilder />
        </main>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}