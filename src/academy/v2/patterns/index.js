import bullPennant from "./bullPennant";

export const PATTERN_REGISTRY = {
  [bullPennant.id]: bullPennant,
};

export function getApprovedPatterns() {
  return Object.values(PATTERN_REGISTRY).filter(
    (pattern) => pattern.status === "approved"
  );
}

export default PATTERN_REGISTRY;
