import { SpellIds } from "../spells/Spell";
export const playerData = new Map();
export class PlayerData {
    constructor(data) {
        this.mana = 100;
        this.selectedSpell = 0;
        this.spellList = [
            SpellIds.Lumos,
            SpellIds.Leviosa,
            SpellIds.Fulmen,
            SpellIds.Reparo
        ];
        if (data) {
            try {
                this.mana = data.mana;
                this.selectedSpell = data.selectedSpell;
                this.spellList = data.spellList;
            }
            catch (e) {
                console.warn(`Error from imported data in PlayerData constructor: ${e}`);
            }
        }
    }
    fillMana() {
    }
    emptyMana() {
    }
    decreaseMana() {
    }
    setSelectedSpell(index) {
        this.selectedSpell = index;
        if (index >= this.spellList.length) {
            this.selectedSpell = this.spellList.length;
        }
        if (index < 0) {
            this.selectedSpell = 0;
        }
    }
}
