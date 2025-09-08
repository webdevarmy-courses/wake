import { router } from "expo-router";
import { useEffect } from "react";

export default function Onboarding3() {
  useEffect(() => {
    // Immediately redirect to first question
    router.replace("/onboarding/questions/1");
  }, []);

  return null;
}


