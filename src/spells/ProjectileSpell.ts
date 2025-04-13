import {Spell} from "./Spell";
import {Player} from "@minecraft/server";
import {spawnMagicProjectile} from "../projectiles/magicProjectile";

export class ProjectileSpell extends Spell {
    cast(): void {
        spawnMagicProjectile(this.caster, this)
    }
}