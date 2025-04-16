import { SpellIds } from "../spells/Spell";
import { GameMode, system, world } from "@minecraft/server";
import { MathUtils } from "../utils/MathUtils";
export const playerData = new Map();
export class PlayerData {
    constructor(playerId, data) {
        this.mana = 100;
        this.maxMana = 100;
        this.selectedSpell = 0;
        this.spellList = [
            SpellIds.Lumos,
            SpellIds.Leviosa,
            SpellIds.Fulmen,
            SpellIds.Reparo
        ];
        this.playerId = playerId;
        if (data) {
            try {
                this.mana = data.mana ?? 100;
                this.maxMana = data.maxMana ?? 100;
                this.selectedSpell = data.selectedSpell ?? 0;
                this.spellList = data.spellList;
            }
            catch (e) {
                console.warn(`Error from imported data in PlayerData constructor: ${e}`);
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
    decreaseMana(value) {
        const player = world.getPlayers().find(p => p.id == this.playerId);
        if (!player)
            return;
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
        if (!player)
            return;
        const mana = Math.ceil(this.mana); // Integer
        const maxMana = Math.ceil(this.maxMana); // Integer
        const manaClipRatio = (MathUtils.clamp(Math.ceil((1 - (this.mana / this.maxMana)) * 100), 0, 100)); // Integer [0 - 100]
        const manaText = `Mana: ${mana}/${maxMana}`;
        const titles = [`ui_mana_clip_ratio:${manaClipRatio}`, `ui_mana_text:${manaText}`];
        this.setTitle(player, titles);
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
    getPlayer() {
        return world.getPlayers().find(p => p.id == this.playerId);
    }
    setTitle(player, titles) {
        titles.forEach((title, i) => {
            system.runTimeout(() => {
                player.runCommand(`title @s title ${title}`);
            }, i); // 1 tick between each change
        });
    }
}
