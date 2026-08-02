import metadata from "./metadata";
import generateScenario from "./generator";

const scenario = {
  ...metadata,
  generate: generateScenario,
};

export {
  metadata,
  generateScenario,
};

export default scenario;
