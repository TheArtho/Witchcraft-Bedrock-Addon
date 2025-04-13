import { Spell, SpellIds } from "./Spell";
import { FailSpell } from "./FailSpell";
import { LeviosaSpell } from "./LeviosaSpell";
import { LumosSpell } from "./LumosSpell";
import { FulmenSpell } from "./FulmenSpell";

export function getSpellFromId(id: SpellIds): Spell {
    switch (id) {
        case SpellIds.Fail: return new FailSpell();
        case SpellIds.Leviosa: return new LeviosaSpell();
        case SpellIds.Lumos: return new LumosSpell();
        case SpellIds.Fulmen: return new FulmenSpell();
    }
}

export function spellIdToString(id: SpellIds): string {
    return SpellIds[id]?.toLowerCase() ?? "unknown";
}