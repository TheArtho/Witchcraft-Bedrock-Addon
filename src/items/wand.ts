import {EntityComponentTypes, EquipmentSlot, Player, system, world} from "@minecraft/server";
import {cycleSpell, getSelectedSpell} from "../interface/spellMenu";
import {Spell} from "../spells/Spell";
import {getSpellFromId} from "../spells/spellRegistry";
import {customEvents} from "../events/customEventHandler";

function isHoldingWand(player: Player) {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
        ?? player.getComponent("inventory")?.container.getItem(player.selectedSlotIndex);
    return item?.typeId === "witchcraft:wizard_wand";
}

customEvents.afterEvents.playerSlotChange.subscribe(({ player }) => {
    // console.log(`${event.player.name} changed slot from ${event.previousSlot} to ${event.currentSlot}`);

    if (isHoldingWand(player)) {
        player.playSound("random.orb", {pitch: 0.5, volume: 0.5});
    }
})

world.afterEvents.playerJoin.subscribe(({ playerId }) => {
    // Delay by 1 tick to ensure the player object is available
    system.runTimeout(() => {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (player && isHoldingWand(player)) {
            player.playSound("random.orb", {pitch: 0.5, volume: 0.5});
        }
    }, 1);
});

// Use of Wizard Wand item
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