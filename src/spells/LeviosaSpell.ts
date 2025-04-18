import {EffectType, Entity, Player} from "@minecraft/server";
import {SpellIds} from "./Spell";
import {ProjectileSpell} from "./ProjectileSpell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";
import {secondsToTick} from "../utils/TimeTick";

export class LeviosaSpell extends ProjectileSpell {

    constructor(caster: Player) {
        super(SpellIds.Leviosa, "Leviosa", "Projette l'adversaire vers le ciel.", MinecraftTextColor.Aqua, caster);
    }

    onEntityHit(caster: Player, target: Entity) {
        try {
            target.addEffect('minecraft:levitation', secondsToTick(5), {
                showParticles: false,
                amplifier: 1
            });
        }
        catch (error) {
            // Skip
            console.log(error);
        }
    }

    getManaCost(): number {
        return 20;
    }
}