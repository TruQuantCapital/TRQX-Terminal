import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function getDisplayName(user) {
  const metadataName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name;

  if (metadataName) return metadataName;

  const emailName = user?.email?.split("@")[0] || "TRQX Member";

  return emailName
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TawkIdentity() {
  const { user, tier } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    let intervalId;
    let timeoutId;

    const identifyVisitor = () => {
      if (typeof window.Tawk_API?.setAttributes !== "function") {
        return false;
      }

      const attributes = {
        name: getDisplayName(user),
        email: user.email,
        tier: tier || "free",
        trqx_user_id: String(user.id || ""),
      };

      window.Tawk_API.setAttributes(attributes, (error) => {
        if (error) {
          console.error("[Tawk] setAttributes failed:", error);
        } else {
          console.log("[Tawk] Visitor identified:", attributes.name);
        }
      });

      return true;
    };

    if (identifyVisitor()) return;

    intervalId = window.setInterval(() => {
      if (identifyVisitor()) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [user, tier]);

  return null;
}