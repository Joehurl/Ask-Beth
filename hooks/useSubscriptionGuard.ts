import { useEffect, useState } from "react";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { isOnboardingComplete } from "@/utils/onboardingStorage";

const FREE_QUESTION_KEY = "beth_free_question_used";

export function useSubscriptionGuard() {
  const { isSubscribed, loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboardingComplete()
      .then(setOnboardingDone)
      .catch(() => setOnboardingDone(true));
  }, [pathname]);

  useEffect(() => {
    if (loading || onboardingDone === null || isSubscribed) return;
    if (!onboardingDone) return;

    // Only redirect if the free question has already been used
    AsyncStorage.getItem(FREE_QUESTION_KEY)
      .then((freeUsed) => {
        if (freeUsed === "true") {
          console.log("[SubscriptionGuard] Free question used and not subscribed — redirecting to paywall");
          router.replace("/paywall");
        } else {
          console.log("[SubscriptionGuard] Free question not yet used — allowing through");
        }
      })
      .catch(() => {
        // On error, be permissive — don't block the user
        console.log("[SubscriptionGuard] AsyncStorage error — allowing through");
      });
  }, [isSubscribed, loading, onboardingDone, router]);
}
