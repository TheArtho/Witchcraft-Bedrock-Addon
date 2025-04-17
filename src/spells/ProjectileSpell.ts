import {Spell} from "./Spell";
import {Player} from "@minecraft/server";
import {spawnMagicProjectile} from "../projectiles/magicProjectile";
import {playerData} from "../player/PlayerData";

export class ProjectileSpell extends Spell {
    cast(): void {

        if (!this.hasEnoughMana()) {
            this.caster.sendMessage("Not enough mana to cast this spell.")
            return;
        }
        spawnMagicProjectile(this.caster, this);
        playerData.get(this.caster.id)?.decreaseMana(this.getManaCost());
    }

    getManaCost(): number {
        return 0;
    }
}