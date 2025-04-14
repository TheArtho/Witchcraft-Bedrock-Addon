import {SpellIds} from "../spells/Spell";

export const playerData = new Map<string, PlayerData>();

export class PlayerData {
    mana : number = 100;
    selectedSpell: number = 0;
    spellList: SpellIds[] = [
        SpellIds.Lumos,
        SpellIds.Leviosa,
        SpellIds.Fulmen
    ];

    constructor(data?: Partial<PlayerData>) {
        if (data) {
            try {
                this.mana = data.mana!;
                this.selectedSpell = data.selectedSpell!;
                this.spellList = data.spellList!;
            }
            catch(e) {
                console.warn(`Error from imported data in PlayerData constructor: ${e}`)
            }
        }
    }

    fillMana() {

    }

    emptyMana() {

    }

    decreaseMana() {

    }

    setSelectedSpell(index : number) {
        this.selectedSpell = index;

        if (index >= this.spellList.length) {
            this.selectedSpell = this.spellList.length;
        }
        if (index < 0) {
            this.selectedSpell = 0;
        }

        console.log(this.selectedSpell)
    }
}