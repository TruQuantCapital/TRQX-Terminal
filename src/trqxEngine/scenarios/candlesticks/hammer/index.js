import metadata from "./metadata";
import generateHammerScenario from "./generator";

const hammerScenario = {
  ...metadata,
  generate: generateHammerScenario,
};

export {
  metadata,
  generateHammerScenario,
};

export default hammerScenario;