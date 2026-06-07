import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

const OnboardingPage = async () => {
  const user = await checkUser();

  if (user) {
    redirect("/dashboard");
  }

  return <div>Onboarding...</div>;
};

export default OnboardingPage;