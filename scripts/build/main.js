import { world } from "@minecraft/server";
import { handleCommand } from "./commands/index";
import "./items/wand.js";
// Debug sur le bâton vanilla
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (item.typeId === "minecraft:stick") {
        try {
            handleCommand("thunder", player, []);
        }
        catch (err) {
            player.sendMessage("§cErreur lors de l'utilisation de l'item.");
            console.error(err);
        }
    }
});
