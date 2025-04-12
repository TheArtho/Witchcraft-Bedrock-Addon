import {Entity, Player, Vector3} from "@minecraft/server";

export default function leviosa(projectile : Entity, direction : Vector3, caster: Player, target: Entity) {
    try {
        target.applyKnockback({x: 0, z: 0}, 1);
    }
    catch (error) {
        // Skip
    }
}