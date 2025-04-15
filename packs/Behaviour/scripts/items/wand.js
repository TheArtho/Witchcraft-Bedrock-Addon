import { EntityComponentTypes, EquipmentSlot, system, world } from "@minecraft/server";
import { cycleSpell, getSelectedSpell } from "../interface/spellMenu";
import { SpellIds } from "../spells/Spell";
import { getSpellFromId } from "../spells/spellRegistry";
import { customEvents } from "../events/customEventHandler";
import { activeSpells } from "../core/activeSpellManager";
import { ReparoSpell } from "../spells/ReparoSpell";
function isPersistentSpell(spell) {
    return typeof spell?.stop === "function";
}
function isHoldingWand(player) {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
        ?? player.getComponent("inventory")?.container.getItem(player.selectedSlotIndex);
    return item?.typeId === "witchcraft:wizard_wand";
}
function updateSpell(player) {
    const previousSpell = activeSpells.get(player.id);
    if (previousSpell && isPersistentSpell(previousSpell)) {
        previousSpell?.stop();
    }
    const selectedSpell = getSelectedSpell(player.id);
    const spell = getSpellFromId(selectedSpell, player);
    spell.setActiveSpell();
    system.run(() => player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Sort sélectionné : ${spell.color}${spell.name}"}]}`));
}
function castSpell(player) {
    let spell = activeSpells.get(player.id);
    if (!spell) {
        const selectedSpell = getSelectedSpell(player.id);
        spell = getSpellFromId(selectedSpell, player);
        spell.setActiveSpell();
    }
    spell?.cast();
}
customEvents.afterEvents.playerSlotChange.subscribe(({ player }) => {
    if (isHoldingWand(player)) {
        updateSpell(player);
    }
    else {
        const spell = activeSpells.get(player.id);
        if (spell && isPersistentSpell(spell)) {
            spell?.stop();
        }
        if (spell) {
            activeSpells.set(player.id, null);
        }
    }
});
world.afterEvents.playerJoin.subscribe(({ playerId }) => {
    // Delay by 1 tick to ensure the player object is available
    system.runTimeout(() => {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (player && isHoldingWand(player)) {
            updateSpell(player);
        }
    }, 1);
});
// Use of Wizard Wand item
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (item?.typeId !== "witchcraft:wizard_wand")
        return;
    if (player.isSneaking) {
        cycleSpell(player.id);
        player.playSound("random.orb", {
            pitch: 0.5,
            volume: 0.5
        });
        updateSpell(player);
        return;
    }
    castSpell(player);
});
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    // Cast spell for Reparo
    if (isHoldingWand(player) &&
        getSelectedSpell(player.id) == SpellIds.Reparo &&
        ReparoSpell.getNonInteractableBlocks().includes(event.block.typeId)) {
        system.run(() => castSpell(player));
        event.cancel = true;
    }
});
