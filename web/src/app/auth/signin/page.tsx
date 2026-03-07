import { redirect } from "next/navigation";

export default function SignInPage() {
  // In self-hosted mode, no sign-in is needed — redirect to dashboard
  redirect("/dashboard");
}
