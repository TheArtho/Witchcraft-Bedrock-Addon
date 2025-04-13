import { activeSpells } from "../core/activeSpellManager";
export var SpellIds;
(function (SpellIds) {
    SpellIds[SpellIds["Fail"] = -1] = "Fail";
    SpellIds[SpellIds["Leviosa"] = 0] = "Leviosa";
    SpellIds[SpellIds["Lumos"] = 1] = "Lumos";
    SpellIds[SpellIds["Fulmen"] = 2] = "Fulmen";
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
}
