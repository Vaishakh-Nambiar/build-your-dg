import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRedirect } from "@/components/AuthRedirect";
import { LoginPage } from "@/components/auth/LoginPage";

export default function Login() {
  return (
    <ErrorBoundary>
      <AuthRedirect>
        <LoginPage />
      </AuthRedirect>
    </ErrorBoundary>
  );
}