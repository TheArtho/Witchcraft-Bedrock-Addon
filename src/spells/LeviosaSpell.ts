import {Entity, Player} from "@minecraft/server";
import {SpellIds} from "./Spell";
import {ProjectileSpell} from "./ProjectileSpell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

export class LeviosaSpell extends ProjectileSpell {

    constructor() {
        super(SpellIds.Leviosa, "Leviosa", "Projette l'adversaire vers le ciel.", MinecraftTextColor.Aqua);
    }

    onEntityHit(caster: Player, target: Entity) {
        try {
            target.applyKnockback({x: 0, z: 0}, 1);
        }
        catch (error) {
            // Skip
        }
    }
}