import {Entity, Player, system} from "@minecraft/server";
import {SpellIds} from "./Spell";
import {ProjectileSpell} from "./ProjectileSpell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

export class FulmenSpell extends ProjectileSpell {

    constructor(caster: Player) {
        super(SpellIds.Fulmen, "Fulmen", "Invoque la foudre sur la cible.", MinecraftTextColor.Yellow, caster);
    }

    onEntityHit(caster: Player, target: Entity) {
        try {
            const posString = `${target.location.x} ${target.location.y} ${target.location.z}`;

            system.run(() => target.dimension.runCommand(`summon lightning_bolt ${posString}`));
        }
        catch (error) {
            // Skip
        }
    }

    getManaCost(): number {
        return 50;
    }
}