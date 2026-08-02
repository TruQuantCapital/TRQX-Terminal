const registry = new Map();

export function registerScenario(scenario) {
  if (!scenario || typeof scenario !== "object") {
    throw new Error("Scenario registration requires an object.");
  }

  if (!scenario.id || typeof scenario.id !== "string") {
    throw new Error("Registered scenarios require a string id.");
  }

  if (typeof scenario.generate !== "function") {
    throw new Error(
      `Scenario "${scenario.id}" must provide a generate function.`
    );
  }

  registry.set(scenario.id, scenario);

  return scenario;
}

export function getScenario(id) {
  const scenario = registry.get(id);

  if (!scenario) {
    throw new Error(`Scenario "${id}" is not registered.`);
  }

  return scenario;
}

export function hasScenario(id) {
  return registry.has(id);
}

export function listScenarios() {
  return Array.from(registry.values()).map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    difficulty: scenario.difficulty,
    tags: scenario.tags ?? [],
  }));
}

export function generateScenario(id, options = {}) {
  const scenario = getScenario(id);
  return scenario.generate(options);
}

export function clearScenarioRegistry() {
  registry.clear();
}

export default {
  registerScenario,
  getScenario,
  hasScenario,
  listScenarios,
  generateScenario,
  clearScenarioRegistry,
};