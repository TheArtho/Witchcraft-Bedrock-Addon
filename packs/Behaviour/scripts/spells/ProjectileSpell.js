import { Spell } from "./Spell";
import { spawnMagicProjectile } from "../projectiles/magicProjectile";
import { playerData } from "../player/PlayerData";
export var MagicProjectileFlag;
(function (MagicProjectileFlag) {
    MagicProjectileFlag[MagicProjectileFlag["CanTouchItems"] = 0] = "CanTouchItems";
    MagicProjectileFlag[MagicProjectileFlag["CanTouchPlants"] = 1] = "CanTouchPlants";
    MagicProjectileFlag[MagicProjectileFlag["CanTouchSpellProjectiles"] = 2] = "CanTouchSpellProjectiles";
    MagicProjectileFlag[MagicProjectileFlag["CanTouchMobs"] = 3] = "CanTouchMobs"; // Not implemented
})(MagicProjectileFlag || (MagicProjectileFlag = {}));
export class ProjectileSpell extends Spell {
    constructor() {
        super(...arguments);
        this.flags = [MagicProjectileFlag.CanTouchMobs];
    }
    cast() {
        if (!this.hasEnoughMana()) {
            this.caster.sendMessage("Not enough mana to cast this spell.");
            return;
        }
        spawnMagicProjectile(this.caster, this, this.flags);
        playerData.get(this.caster.id)?.decreaseMana(this.getManaCost());
    }
    getManaCost() {
        return 0;
    }
}
