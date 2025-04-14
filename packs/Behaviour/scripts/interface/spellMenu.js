import { SpellIds } from "../spells/Spell";
import { playerData } from "../player/PlayerData";
export function getSelectedSpell(playerId) {
    if (playerData.has(playerId)) {
        const data = playerData.get(playerId);
        const index = data.selectedSpell;
        if (data.spellList.length > 0) {
            return data.spellList[index];
        }
        else {
            console.log("return fail 1");
            return SpellIds.Fail;
        }
    }
    else {
        console.log("return fail 2");
        return SpellIds.Fail;
    }
}
export function cycleSpell(playerId) {
    if (playerData.has(playerId)) {
        const data = playerData.get(playerId);
        const current = data.selectedSpell;
        const next = (current + 1) % data.spellList.length;
        data.setSelectedSpell(next);
    }
}
