import { redirect } from "next/navigation";

import Auth from "@/components/auth/Auth";
import { getSessionUser } from "@/lib/session";

export default async function RegisterPage() {
  // Already signed in with a *valid* user? Skip the form.
  if (await getSessionUser()) {
    redirect("/dashboard");
  }

  return <Auth mode="register" />;
}
