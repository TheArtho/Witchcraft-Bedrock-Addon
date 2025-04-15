import {SpellIds} from "../spells/Spell";
import {playerData} from "../player/PlayerData";

export function getSelectedSpell(playerId: string) {
    if (playerData.has(playerId)) {
        const data = playerData.get(playerId);
        const index = data!.selectedSpell;
        if (data!.spellList.length > 0) {
            return data!.spellList[index];
        }
        else {
            return SpellIds.Fail;
        }
    }
    else {
        return SpellIds.Fail;
    }
}

export function cycleSpell(playerId: string) {
    if (playerData.has(playerId)) {
        const data = playerData.get(playerId);
        const current = data!.selectedSpell;
        const next = (current + 1) % data!.spellList.length;
        data!.setSelectedSpell(next);
    }
}