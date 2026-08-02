import hammerScenario from "./scenarios/candlesticks/hammer";
import shootingStarScenario from "./scenarios/candlesticks/shootingStar";
import bullishEngulfingScenario from "./scenarios/candlesticks/bullishEngulfing";
import bearishEngulfingScenario from "./scenarios/candlesticks/bearishEngulfing";
import dojiScenario from "./scenarios/candlesticks/doji";

import {
  registerScenario,
  generateScenario,
  getScenario,
  hasScenario,
  listScenarios,
} from "./engine/scenarioRegistry";

[
  hammerScenario,
  shootingStarScenario,
  bullishEngulfingScenario,
  bearishEngulfingScenario,
  dojiScenario,
].forEach((scenario) => {
  if (!hasScenario(scenario.id)) {
    registerScenario(scenario);
  }
});

export {
  generateScenario,
  getScenario,
  hasScenario,
  listScenarios,
};

export default {
  generateScenario,
  getScenario,
  hasScenario,
  listScenarios,
};
