// wand/WandLogic.ts
import { Direction, Player, EntityComponentTypes, EquipmentSlot, system } from "@minecraft/server";
import { getSpellFromId } from "../../spells/spellRegistry";
import { Spell, SpellIds } from "../../spells/Spell";
import { activeSpells } from "../../core/activeSpellManager";
import { PersistentSpell } from "../../spells/PersistentSpell";
import { GestureTracker } from "../../player/GestureTracker";

const spellDirections = new Map<string, SpellIds>([
    ["Down,Up", SpellIds.Leviosa],
    ["Down,East", SpellIds.Lumos],
    ["Down,West", SpellIds.Reparo],
    ["Up,Down", SpellIds.Expelliarmus],
    ["Up,East", SpellIds.Accio],
]);

export const playerDirections = new Map<string, Direction[]>();

export function isPersistentSpell(spell: any): spell is PersistentSpell {
    return typeof spell?.stop === "function";
}

export function isHoldingWand(player: Player) {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
        ?? player.getComponent("inventory")?.container.getItem(player.selectedSlotIndex);
    return item?.typeId === "witchcraft:wizard_wand";
}

function sequenceKey(seq: Direction[]): string {
    return seq.join(",");
}

export function startGesture(player: Player) {
    playerDirections.set(player.id, []);
    GestureTracker.startTracking(player, (direction) => registerDirection(direction, player));
}

export function stopGesture(player: Player) {
    GestureTracker.stopTracking(player);
    playerDirections.delete(player.id);
}

function updateSpellMovement(player: Player, selectedSpell : SpellIds) {
    const previousSpell = activeSpells.get(player.id);
    if (previousSpell && isPersistentSpell(previousSpell)) {
        previousSpell?.stop();
    }
    const spell : Spell = getSpellFromId(selectedSpell, player);
    spell.setActiveSpell();
    system.run(
        () => player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Sort sélectionné : ${spell.color}${spell.name}"}]}`)
    );
}

function getDirectionSound(direction : Direction) : number {
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

export function registerDirection(direction: Direction, player: Player) {
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
        updateSpellMovement(player, spellId!);
        const spell = activeSpells.get(player.id);
        if (spell && isPersistentSpell(spell)) {
            spell.cast();
        }
        else {
            player.playSound("note.harp", { volume: 0.5 });
        }
        stopGesture(player);
    }
    else {
        player.playSound("random.orb", { volume: 0.25, pitch: getDirectionSound(direction)});
    }
}