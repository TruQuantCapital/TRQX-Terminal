export function createScenarioDefinition({
  metadata,
  generate,
}) {
  if (!metadata || typeof metadata !== "object") {
    throw new Error(
      "createScenarioDefinition requires metadata."
    );
  }

  if (!metadata.id || typeof metadata.id !== "string") {
    throw new Error(
      "Scenario metadata requires a string id."
    );
  }

  if (typeof generate !== "function") {
    throw new Error(
      `Scenario "${metadata.id}" requires a generate function.`
    );
  }

  return Object.freeze({
    ...metadata,
    generate,
  });
}

export default createScenarioDefinition;
