// core/InitManager.ts
import {system, world} from "@minecraft/server";
import {loadPlayerData} from "./save/SaveLogic";

let hasInit = false;

export class InitManager {
    static initialize(): void {
        if (hasInit) return;
        hasInit = true;

        // Load data of connected players (script reload case)
        system.run(() => {
            for (const player of world.getPlayers()) {
                loadPlayerData(player);
            }
        });
    }

    static get hasInit(): boolean {
        return hasInit;
    }

    static cleanupLumosEntities() {
        const dimensions = ["overworld", "nether", "the_end"]
        let entityAmount = 0;

        dimensions.forEach((dimensionId) => {
            const dimension = world.getDimension(dimensionId);
            const players = dimension.getPlayers();
            if (players.length > 1) return;

            const entities = dimension.getEntities({
                type: "witchcraft:lumos_entity"
            });

            entityAmount += entities.length;

            for (const e of entities) {
                const pos = e.location;
                const block = dimension.getBlock(pos);

                system.run(() => {
                    if (block?.typeId === "minecraft:light_block_15") {
                        dimension.setBlockType(pos, "minecraft:air");
                    }

                    if (e.isValid) {
                        e.triggerEvent("minecraft:despawn_now");
                    }
                });
            }
        })

        if (entityAmount > 0) {
            console.log(`[Witchcraft] Light entities successfully killed.`);
        }
        else {
            console.log(`[Witchcraft] No light entity found.`);
        }
    }
}
