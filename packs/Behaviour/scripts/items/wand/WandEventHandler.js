// wand/WandEventHandler.ts
import { world } from "@minecraft/server";
import { isHoldingWand, startGesture, stopGesture } from "./WandLogic";
import { GestureTracker } from "../../player/GestureTracker";
import { activeSpells } from "../../core/activeSpellManager";
import { SpellIds } from "../../spells/Spell";
import { ReparoSpell } from "../../spells/ReparoSpell";
import { isPersistentSpell, playerDirections } from "./WandLogic";
import { witchcraft } from "../../core/Witchcraft";
export class WandEventHandler {
    static register() {
        // Slot change event for Wizard Wand
        witchcraft.afterEvents.playerSlotChange.subscribe(({ player }) => {
            if (!isHoldingWand(player)) {
                const spell = activeSpells.get(player.id);
                if (spell) {
                    if (isPersistentSpell(spell)) {
                        spell.stop();
                    }
                    activeSpells.delete(player.id);
                }
                if (GestureTracker.isTracking(player)) {
                    stopGesture(player);
                }
            }
        });
        world.afterEvents.playerDimensionChange.subscribe((event) => {
            if (activeSpells.has(event.player.id)) {
                const spell = activeSpells.get(event.player.id);
                if (spell && isPersistentSpell(spell)) {
                    spell.stop();
                    activeSpells.delete(event.player.id);
                }
            }
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
                    startGesture(player);
                }
            }
            else {
                stopGesture(player);
            }
        });
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
    }
}
