/**
 * ==========================================================
 * TRQX Scenario Loader
 * ==========================================================
 */

class ScenarioLoader {

    constructor() {

        this.registry = new Map();

    }

    register(id, scenario) {

        if (!id) {
            throw new Error("Scenario requires an id.");
        }

        this.registry.set(id, scenario);

    }

    get(id) {

        if (!this.registry.has(id)) {
            throw new Error(`Scenario '${id}' not found.`);
        }

        return this.registry.get(id);

    }

    has(id) {

        return this.registry.has(id);

    }

    list() {

        return [...this.registry.keys()];

    }

    random() {

        const ids = this.list();

        return this.get(
            ids[
                Math.floor(
                    Math.random() * ids.length
                )
            ]
        );

    }

}

const loader = new ScenarioLoader();

export default loader;