import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRedirect } from "@/components/AuthRedirect";
import { SignupPage } from "@/components/auth/SignupPage";

export default function Signup() {
  return (
    <ErrorBoundary>
      <AuthRedirect>
        <SignupPage />
      </AuthRedirect>
    </ErrorBoundary>
  );
}