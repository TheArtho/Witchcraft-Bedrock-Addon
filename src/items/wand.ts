import {Direction, EntityComponentTypes, EquipmentSlot, Player, system, world} from "@minecraft/server";
import {cycleSpell, getSelectedSpell} from "../interface/spellMenu";
import {Spell, SpellIds} from "../spells/Spell";
import {getSpellFromId} from "../spells/spellRegistry";
import {customEvents} from "../events/customEventHandler";
import {activeSpells} from "../core/activeSpellManager";
import {PersistentSpell} from "../spells/PersistentSpell";
import {ReparoSpell} from "../spells/ReparoSpell";
import {GestureTracker} from "../player/GestureTracker";
import {colorText} from "../utils/colorText";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

// Helper to transform a direction array into a sequence of key string
function sequenceKey(sequence: Direction[]): string {
    return sequence.join(",");
}

const spellDirections = new Map<string, SpellIds>([
    [sequenceKey([Direction.Up, Direction.Down]), SpellIds.Leviosa],
    [sequenceKey([Direction.Down, Direction.East]), SpellIds.Lumos]
]);

const playerDirections = new Map<string, Direction[]>();

function isPersistentSpell(spell: any): spell is PersistentSpell {
    return typeof spell?.stop === "function";
}

function isHoldingWand(player: Player) {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
        ?? player.getComponent("inventory")?.container.getItem(player.selectedSlotIndex);
    return item?.typeId === "witchcraft:wizard_wand";
}

function updateSpell(player: Player) {
    const previousSpell = activeSpells.get(player.id);
    if (previousSpell && isPersistentSpell(previousSpell)) {
        previousSpell?.stop();
    }
    const selectedSpell = getSelectedSpell(player.id);
    const spell : Spell = getSpellFromId(selectedSpell, player);
    spell.setActiveSpell();
    system.run(
        () => player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Sort sélectionné : ${spell.color}${spell.name}"}]}`)
    );
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

function castSpell(player : Player) {
    let spell = activeSpells.get(player.id);
    if (!spell) {
        const selectedSpell = getSelectedSpell(player.id);
        spell = getSpellFromId(selectedSpell, player);
        spell.setActiveSpell();
    }
    spell?.cast();
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

function registerDirection(direction: Direction, player: Player) {
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

    // Feedback the player
    player.sendMessage(`${Direction[direction]}`);

    const sequence = sequenceKey(playerDirections.get(id)!);

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
        stopTracking(player);
    }
    else {
        player.playSound("random.orb", { volume: 0.25, pitch: getDirectionSound(direction)});
    }
}

function startTracking(player : Player, callback: (dir: Direction, player: Player) => void) {
    GestureTracker.startTracking(player, callback);
    player.sendMessage(colorText("Détection mouvement activée", MinecraftTextColor.Green));
}

function stopTracking(player : Player) {
    GestureTracker.stopTracking(player);
    player.sendMessage(colorText("Détection mouvement désactivée", MinecraftTextColor.Red));
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
})

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

    if (item?.typeId !== "witchcraft:wizard_wand") return;

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

    // Cast spell for Reparo
    if (isHoldingWand(player) &&
        getSelectedSpell(player.id) == SpellIds.Reparo &&
        ReparoSpell.getNonInteractableBlocks().includes(event.block.typeId))
    {
        system.run(() => castSpell(player));
        event.cancel = true;
    }
})