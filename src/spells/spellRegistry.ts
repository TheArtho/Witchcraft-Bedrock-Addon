import {Spell, SpellIds} from "./Spell";
import {FailSpell} from "./FailSpell";
import {LeviosaSpell} from "./LeviosaSpell";
import {LumosSpell} from "./LumosSpell";
import {FulmenSpell} from "./FulmenSpell";
import {Player} from "@minecraft/server";
import {ReparoSpell} from "./ReparoSpell";

export function getSpellFromId(id: SpellIds, player : Player): Spell {
    switch (id) {
        case SpellIds.Leviosa: return new LeviosaSpell(player);
        case SpellIds.Lumos: return new LumosSpell(player);
        case SpellIds.Fulmen: return new FulmenSpell(player);
        case SpellIds.Reparo: return new ReparoSpell(player);
        default: return new FailSpell(player);
    }
}

export function spellIdToString(id: SpellIds): string {
    return SpellIds[id]?.toLowerCase() ?? "unknown";
}