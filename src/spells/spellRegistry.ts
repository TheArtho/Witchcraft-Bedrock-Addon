import { Spell, SpellIds } from "./Spell";
import { FailSpell } from "./FailSpell";
import { LeviosaSpell } from "./LeviosaSpell";
import { LumosSpell } from "./LumosSpell";
import { FulmenSpell } from "./FulmenSpell";
import {Player} from "@minecraft/server";

export function getSpellFromId(id: SpellIds, player : Player): Spell {
    switch (id) {
        case SpellIds.Fail: return new FailSpell(player);
        case SpellIds.Leviosa: return new LeviosaSpell(player);
        case SpellIds.Lumos: return new LumosSpell(player);
        case SpellIds.Fulmen: return new FulmenSpell(player);
    }
}

export function spellIdToString(id: SpellIds): string {
    return SpellIds[id]?.toLowerCase() ?? "unknown";
}