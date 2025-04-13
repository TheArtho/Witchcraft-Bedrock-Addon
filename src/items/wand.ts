import {EntityComponentTypes, EquipmentSlot, Player, system, world} from "@minecraft/server";
import {cycleSpell, getSelectedSpell} from "../interface/spellMenu";
import {Spell, SpellIds} from "../spells/Spell";
import {getSpellFromId} from "../spells/spellRegistry";
import {customEvents} from "../events/customEventHandler";
import {activeSpells} from "../core/activeSpellManager";
import {LumosSpell} from "../spells/LumosSpell";
import {PersistentSpell} from "../spells/PersistentSpell";

function isPersistent(spell: any): spell is PersistentSpell {
    return typeof spell.stop === "function" && "isActive" in spell;
}

function isHoldingWand(player: Player) {
    const item = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand)
        ?? player.getComponent("inventory")?.container.getItem(player.selectedSlotIndex);
    return item?.typeId === "witchcraft:wizard_wand";
}

function updateSpell(player: Player) {
    const previousSpell = activeSpells.get(player.id);
    if (previousSpell && isPersistent(previousSpell)) {
        previousSpell.stop();
    }
    const selectedSpell = getSelectedSpell(player.id);
    const spell : Spell = getSpellFromId(selectedSpell, player);
    spell.setActiveSpell();
    system.run(
        () => player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"Sort sélectionné : ${spell.color}${spell.name}"}]}`)
    );
}

customEvents.afterEvents.playerSlotChange.subscribe(({ player }) => {
    if (isHoldingWand(player)) {
        updateSpell(player);
    }
    else {
        const spell = activeSpells.get(player.id);
        if (spell) {
            activeSpells.set(player.id, null);
        }
    }
})

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

    if (player.isSneaking) {
        cycleSpell(player.id);
        player.playSound("random.orb", {
            pitch: 0.5,
            volume: 0.5
        });
        updateSpell(player);
        return;
    }


    let spell = activeSpells.get(player.id);
    if (!spell) {
        spell = getSpellFromId(SpellIds.Lumos, player);
        spell.setActiveSpell();
    }
    spell?.cast();
});