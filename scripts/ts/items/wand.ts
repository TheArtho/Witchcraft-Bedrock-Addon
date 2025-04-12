import { spawnMagicProjectile } from "../projectiles/magicProjectile";
import {system, world} from "@minecraft/server";
import {cycleSpell, getSelectedSpell} from "../interface/spellMenu";

world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (item?.typeId !== "witchcraft:wizard_wand") return;

    if (player.isSneaking) {
        cycleSpell(player.id);
        player.playSound("random.orb", {
            pitch: 0.5,
            volume: 0.5
        });
        const selectedSpell = getSelectedSpell(player.id);
        system.run(
            () => player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Sort sélectionné : ${selectedSpell.name}"}]}`)
        );
        return;
    }

    const selectedSpell = getSelectedSpell(player.id);
    spawnMagicProjectile(player, selectedSpell.id);
});