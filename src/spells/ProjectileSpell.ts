import {Spell} from "./Spell";
import {Player} from "@minecraft/server";
import {spawnMagicProjectile} from "../projectiles/magicProjectile";
import {playerData} from "../player/PlayerData";

export enum MagicProjectileFlag {
    CanTouchItems,
    CanTouchPlants, // Not implemented
    CanTouchSpellProjectiles,   // Not implemented
    CanTouchMobs    // Not implemented
}

export class ProjectileSpell extends Spell {
    protected flags : MagicProjectileFlag[] = [MagicProjectileFlag.CanTouchMobs];

    cast(): void {
        if (!this.hasEnoughMana()) {
            this.caster.sendMessage("Not enough mana to cast this spell.")
            return;
        }
        spawnMagicProjectile(this.caster, this, this.flags);
        playerData.get(this.caster.id)?.decreaseMana(this.getManaCost());
    }

    getManaCost(): number {
        return 0;
    }
}