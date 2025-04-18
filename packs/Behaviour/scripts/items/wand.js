import { Direction, EntityComponentTypes, EquipmentSlot, system, world } from "@minecraft/server";
import { getSelectedSpell } from "../interface/spellMenu";
import { SpellIds } from "../spells/Spell";
import { getSpellFromId } from "../spells/spellRegistry";
import { customEvents } from "../events/customEventHandler";
import { activeSpells } from "../core/activeSpellManager";
import { ReparoSpell } from "../spells/ReparoSpell";
import { GestureTracker } from "../player/GestureTracker";
// Helper to transform a direction array into a sequence of key string
function sequenceKey(sequence) {
    return sequence.join(",");
}
const spellDirections = new Map([
    [sequenceKey([Direction.Down, Direction.Up]), SpellIds.Leviosa],
    [sequenceKey([Direction.Down, Direction.East]), SpellIds.Lumos],
    [sequenceKey([Direction.Down, Direction.West]), SpellIds.Reparo],
    [sequenceKey([Direction.Up, Direction.Down]), SpellIds.Expelliarmus],
    [sequenceKey([Direction.Up, Direction.East]), SpellIds.Accio],
]);
const playerDirections = new Map();
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
function updateSpellMovement(player, selectedSpell) {
    const previousSpell = activeSpells.get(player.id);
    if (previousSpell && isPersistentSpell(previousSpell)) {
        previousSpell?.stop();
    }
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
function getDirectionSound(direction) {
    switch (direction) {
        case Direction.Up:
            return 1;
        case Direction.Down:
            return 0.25;
        case Direction.East:
            return 0.45;
        case Direction.West:
            return 0.75;
        default:
            return 1;
    }
}
function registerDirection(direction, player) {
    const id = player.id;
    const history = playerDirections.get(id) ?? [];
    // Verify that the direction is different from the last one registered
    if (history.length === 0 || history[history.length - 1] !== direction) {
        // Push back the direction
        history.push(direction);
        // If more than 2, delete the first one
        if (history.length > 2) {
            history.shift();
        }
        // Update the map
        playerDirections.set(id, history);
    }
    const sequence = sequenceKey(history);
    let actionText = sequence;
    actionText = actionText.replace("Up", "↑");
    actionText = actionText.replace("Down", "↓");
    actionText = actionText.replace("East", "→");
    actionText = actionText.replace("West", "←");
    actionText = actionText.replace(',', ' ');
    // Feedback the player
    player.onScreenDisplay.setActionBar(`${actionText}`);
    if (spellDirections.has(sequence)) {
        const spellId = spellDirections.get(sequence);
        updateSpellMovement(player, spellId);
        const spell = activeSpells.get(player.id);
        if (spell && isPersistentSpell(spell)) {
            spell.cast();
        }
        else {
            player.playSound("note.harp", { volume: 0.5 });
        }
        stopTracking(player);
    }
    else {
        player.playSound("random.orb", { volume: 0.25, pitch: getDirectionSound(direction) });
    }
}
function startTracking(player, callback) {
    GestureTracker.startTracking(player, callback);
    // player.sendMessage(colorText("Détection mouvement activée", MinecraftTextColor.Green));
}
function stopTracking(player) {
    GestureTracker.stopTracking(player);
    // player.sendMessage(colorText("Détection mouvement désactivée", MinecraftTextColor.Red));
}
// Slot change event for Wizard Wand
customEvents.afterEvents.playerSlotChange.subscribe(({ player }) => {
    if (!isHoldingWand(player)) {
        const spell = activeSpells.get(player.id);
        if (spell) {
            if (isPersistentSpell(spell)) {
                spell.stop();
            }
            activeSpells.delete(player.id);
        }
        if (GestureTracker.isTracking(player)) {
            stopTracking(player);
        }
    }
});
// Old version of the wand
/*
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
})
*/
world.afterEvents.playerDimensionChange.subscribe((event) => {
    if (activeSpells.has(event.player.id)) {
        const spell = activeSpells.get(event.player.id);
        if (spell && isPersistentSpell(spell)) {
            spell.stop();
            activeSpells.delete(event.player.id);
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
    if (!GestureTracker.isTracking(player)) {
        if (activeSpells.has(player.id)) {
            const spell = activeSpells.get(player.id);
            if (spell) {
                // If there is an active persistent spell then disable it
                if (isPersistentSpell(spell)) {
                    spell.stop();
                }
                // Otherwise cast the spell
                else {
                    spell.cast();
                }
            }
            activeSpells.delete(player.id);
        }
        else {
            playerDirections.delete(player.id);
            startTracking(player, registerDirection);
        }
    }
    else {
        stopTracking(player);
    }
});
// Old version of wizard wand use (with spell cycle menu)
/*
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
        updateSpell(player);
        return;
    }

    castSpell(player);
});
*/
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    // Try cast spell for Reparo
    if (isHoldingWand(player)) {
        const spell = activeSpells.get(player.id);
        if (spell?.id === SpellIds.Reparo &&
            ReparoSpell.getNonInteractableBlocks().includes(event.block.typeId)) {
            spell.cast();
            activeSpells.delete(player.id);
            event.cancel = true;
        }
    }
});
