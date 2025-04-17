import { GameMode } from "@minecraft/server";
import { activeSpells } from "../core/activeSpellManager";
import { playerData } from "../player/PlayerData";
export var SpellIds;
(function (SpellIds) {
    SpellIds[SpellIds["Fail"] = -1] = "Fail";
    SpellIds[SpellIds["Leviosa"] = 1] = "Leviosa";
    SpellIds[SpellIds["Lumos"] = 2] = "Lumos";
    SpellIds[SpellIds["Fulmen"] = 3] = "Fulmen";
    SpellIds[SpellIds["Reparo"] = 4] = "Reparo";
})(SpellIds || (SpellIds = {}));
export class Spell {
    constructor(id, name, description, color, caster) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
        this.caster = caster;
    }
    setActiveSpell() {
        activeSpells.set(this.caster.id, this);
    }
    hasEnoughMana() {
        return this.caster.getGameMode() == GameMode.creative || playerData.get(this.caster.id).mana - this.getManaCost() >= 0;
    }
}
