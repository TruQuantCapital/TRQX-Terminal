import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function getDisplayName(user) {
  const metadata = user?.user_metadata || {};

  const fullName =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.fullName;

  if (fullName?.trim()) {
    return fullName.trim();
  }

  const firstName =
    metadata.first_name ||
    metadata.firstName ||
    metadata.given_name;

  const lastName =
    metadata.last_name ||
    metadata.lastName ||
    metadata.family_name;

  const combinedName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (combinedName) {
    return combinedName;
  }

  const emailName = user?.email?.split("@")[0] || "TRQX Member";

  return emailName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[._-]/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
    )
    .join(" ");
}

export default function TawkIdentity() {
  const { user, tier } = useAuth();

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    let intervalId = null;
    let timeoutId = null;

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

      console.log("[Tawk] Sending identity:", attributes);

      window.Tawk_API.setAttributes(attributes, (error) => {
        if (error) {
          console.error("[Tawk] setAttributes failed:", error);
          return;
        }

        console.log(
          "[Tawk] Visitor identified:",
          attributes.name,
          attributes.email
        );
      });

      return true;
    };

    if (identifyVisitor()) {
      return;
    }

    intervalId = window.setInterval(() => {
      if (identifyVisitor()) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }, 1000);

    timeoutId = window.setTimeout(() => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

      console.warn(
        "[Tawk] Widget did not become ready within 15 seconds."
      );
    }, 15000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [user, tier]);

  return null;
}