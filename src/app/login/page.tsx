import { redirect } from "next/navigation";

import Auth from "@/components/auth/Auth";
import { getSessionUser } from "@/lib/session";

export default async function LoginPage() {
  // Already signed in with a *valid* user? Skip the form. (This used to live
  // in middleware, but a server redirect after navigation avoids React
  // hydration warnings on the auth pages.)
  if (await getSessionUser()) {
    redirect("/dashboard");
  }

  return <Auth mode="login" />;
}
