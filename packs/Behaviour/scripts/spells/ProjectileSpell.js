import { Spell } from "./Spell";
import { spawnMagicProjectile } from "../projectiles/magicProjectile";
export class ProjectileSpell extends Spell {
    cast(caster) {
        spawnMagicProjectile(caster, this);
    }
}
