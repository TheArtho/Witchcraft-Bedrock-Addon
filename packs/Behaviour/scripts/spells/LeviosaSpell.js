import { SpellIds } from "./Spell";
import { ProjectileSpell } from "./ProjectileSpell";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
export class LeviosaSpell extends ProjectileSpell {
    constructor(caster) {
        super(SpellIds.Leviosa, "Leviosa", "Projette l'adversaire vers le ciel.", MinecraftTextColor.Aqua, caster);
    }
    onEntityHit(caster, target) {
        try {
            target.applyKnockback({ x: 0, z: 0 }, 1);
        }
        catch (error) {
            // Skip
        }
    }
    getManaCost() {
        return 20;
    }
}
