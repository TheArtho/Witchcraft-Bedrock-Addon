// events/ManaPotionEventHandler.ts
import { world } from "@minecraft/server";
import { handlePotionUse } from "./ManaPotionLogic";
export class ManaPotionEventHandler {
    static register() {
        world.afterEvents.itemCompleteUse.subscribe((event) => {
            const player = event.source;
            const itemId = event.itemStack?.typeId;
            if (player && itemId) {
                handlePotionUse(player, itemId);
            }
        });
    }
}
