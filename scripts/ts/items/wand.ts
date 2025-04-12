import { spawnMagicProjectile } from "../projectiles/magicProjectile";
import {world} from "@minecraft/server";

world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (item?.typeId !== "witchcraft:wizard_wand") return;

    spawnMagicProjectile(player, "expelliarmus");
});
