import {SpellIds} from "../spells/Spell";

export const spellList = [
    SpellIds.Lumos,
    SpellIds.Leviosa,
    SpellIds.Fulmen,
];

const playerSpells = new Map<string, number>(); // player.id -> selectedSpellIndex

export function getSelectedSpell(playerId: string) {
    const index = playerSpells.get(playerId) ?? 0;
    return spellList[index];
}

export function cycleSpell(playerId: string) {
    const current = playerSpells.get(playerId) ?? 0;
    const next = (current + 1) % spellList.length;
    playerSpells.set(playerId, next);
}