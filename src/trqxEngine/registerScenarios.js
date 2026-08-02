import loader from "./engine/ScenarioLoader";

import HammerScenario
from "./scenarios/candlesticks/hammer";

loader.register(
    HammerScenario.id,
    HammerScenario
);

export default loader;