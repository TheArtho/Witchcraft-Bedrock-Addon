// core/InitEventHandler.ts
import { system, world } from "@minecraft/server";
import { InitManager } from "./InitManager";

export class InitEventHandler {
    static register(): void {
        world.afterEvents.playerJoin.subscribe(() => {
            if (!InitManager.hasInit) return;

            const waitInterval = system.runInterval(() => {
                const players = world.getPlayers();
                if (players.length === 0) return;

                system.clearRun(waitInterval);
                InitManager.cleanupLumosEntities(); // clean lumos entities
            });
        });
    }
}
