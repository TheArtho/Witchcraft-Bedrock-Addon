import { Spell } from "./Spell";
import { spawnMagicProjectile } from "../projectiles/magicProjectile";
import { playerData } from "../player/PlayerData";
export class ProjectileSpell extends Spell {
    cast() {
        if (!this.hasEnoughMana()) {
            this.caster.sendMessage("Not enough mana to cast this spell.");
            return;
        }
        spawnMagicProjectile(this.caster, this);
        playerData.get(this.caster.id)?.decreaseMana(this.getManaCost());
    }
    getManaCost() {
        return 0;
    }
}
