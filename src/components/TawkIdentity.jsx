import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function nameFromUser(user) {
  const metadataName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name;

  if (metadataName) {
    return metadataName;
  }

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
    if (!user?.email) {
      return;
    }

    const identifyVisitor = () => {
      if (!window.Tawk_API?.setAttributes) {
        return false;
      }

      const attributes = {
        name: nameFromUser(user),
        email: user.email,
        tier: tier || "free",
        trqx_user_id: user.id || "",
      };

      window.Tawk_API.setAttributes(attributes, (error) => {
        if (error) {
          console.error("[Tawk] Visitor identification failed:", error);
          return;
        }

        console.log("[Tawk] Visitor identified:", attributes.name);
      });

      return true;
    };

    if (identifyVisitor()) {
      return;
    }

    const previousOnLoad = window.Tawk_API?.onLoad;

    window.Tawk_API = window.Tawk_API || {};

    window.Tawk_API.onLoad = function () {
      if (typeof previousOnLoad === "function") {
        previousOnLoad();
      }

      identifyVisitor();
    };

    const retryInterval = window.setInterval(() => {
      if (identifyVisitor()) {
        window.clearInterval(retryInterval);
      }
    }, 1000);

    const timeout = window.setTimeout(() => {
      window.clearInterval(retryInterval);
    }, 15000);

    return () => {
      window.clearInterval(retryInterval);
      window.clearTimeout(timeout);
    };
  }, [user, tier]);

  return null;
}