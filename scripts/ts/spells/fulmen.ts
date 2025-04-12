import {Entity, Player, system, Vector3} from "@minecraft/server";

export default function fulmen(projectile : Entity, direction : Vector3, caster: Player, target: Entity) {
    try {
        const posString = `${target.location.x} ${target.location.y} ${target.location.z}`;

        system.run(() => target.dimension.runCommand(`summon lightning_bolt ${posString}`));
    }
    catch (error) {
        // Skip
    }
}