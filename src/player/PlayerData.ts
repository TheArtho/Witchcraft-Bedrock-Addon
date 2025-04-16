import {SpellIds} from "../spells/Spell";
import {GameMode, Player, RawMessage, system, world} from "@minecraft/server";
import {MathUtils} from "../utils/MathUtils";

export const playerData = new Map<string, PlayerData>();

export class PlayerData {
    playerId : string;
    mana : number = 100;
    maxMana : number = 100;
    selectedSpell : number = 0;
    spellList : SpellIds[] = [
        SpellIds.Lumos,
        SpellIds.Leviosa,
        SpellIds.Fulmen,
        SpellIds.Reparo
    ];

    constructor(playerId : string, data?: Partial<PlayerData>) {
        this.playerId = playerId;

        if (data) {
            try {
                this.mana = data.mana ?? 100;
                this.maxMana = data.maxMana ?? 100;
                this.selectedSpell = data.selectedSpell ?? 0;
                this.spellList = data.spellList!;
            }
            catch(e) {
                console.warn(`Error from imported data in PlayerData constructor: ${e}`)
            }
        }

        this.updateManaUi();
    }

    fillMana() {
        this.mana = this.maxMana;

        this.updateManaUi();
    }

    emptyMana() {
        this.mana = 0;

        this.updateManaUi();
    }

    decreaseMana(value : number) {
        const player = world.getPlayers().find(p => p.id == this.playerId)
        if (!player) return;

        if (player.getGameMode() !== GameMode.survival) {
            return;
        }

        this.mana -= value;

        if (this.mana < 0) {
            // For testing purposes
            this.fillMana();
            //this.mana = 0;
        }

        this.updateManaUi();
    }

    updateManaUi() {
        const player = this.getPlayer();
        if (!player) return;

        const mana = Math.ceil(this.mana);  // Integer
        const maxMana = Math.ceil(this.maxMana);    // Integer
        const manaClipRatio = (MathUtils.clamp(Math.ceil((1 - (this.mana / this.maxMana)) * 100),
            0, 100));  // Integer [0 - 100]
        const manaText = `Mana: ${mana}/${maxMana}`;

        const titles = [`ui_mana_text:${manaText}`, `ui_mana_clip_ratio:${manaClipRatio}`]

        this.setTitle(player, titles);
    }

    setSelectedSpell(index : number) {
        this.selectedSpell = index;

        if (index >= this.spellList.length) {
            this.selectedSpell = this.spellList.length;
        }
        if (index < 0) {
            this.selectedSpell = 0;
        }
    }

    private getPlayer() {
        return world.getPlayers().find(p => p.id == this.playerId)
    }

    private setTitle(player : Player, titles : string[]) {
        let index : number = 0;

        const interval = system.runInterval(() => {
            // player.dimension.runCommand(`title @a times 0 0 0`)
            player.dimension.runCommand(`title @a title ${titles[index]}`)
            index++;

            if (index >= titles.length) {
                system.clearRun(interval);
            }
        });
    }
}