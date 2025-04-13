import {system, world} from "@minecraft/server";
import {cycleSpell, getSelectedSpell} from "../interface/spellMenu";
import {Spell} from "../spells/Spell";
import {getSpellFromId} from "../spells/spellRegistry";

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
        const spell : Spell = getSpellFromId(selectedSpell);
        system.run(
            () => player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Sort sélectionné : ${spell.color}${spell.name}"}]}`)
        );
        return;
    }

    const selectedSpell = getSelectedSpell(player.id);
    const spell : Spell = getSpellFromId(selectedSpell);
    spell.cast(player);
});