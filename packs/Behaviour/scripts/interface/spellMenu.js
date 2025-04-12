export const spellList = [
    { id: "fulmen", name: "§eFulmen" },
    { id: "leviosa", name: "§7Leviosa" },
];
const playerSpells = new Map(); // player.id -> selectedSpellIndex
export function getSelectedSpell(playerId) {
    const index = playerSpells.get(playerId) ?? 0;
    return spellList[index];
}
export function cycleSpell(playerId) {
    const current = playerSpells.get(playerId) ?? 0;
    const next = (current + 1) % spellList.length;
    playerSpells.set(playerId, next);
}
