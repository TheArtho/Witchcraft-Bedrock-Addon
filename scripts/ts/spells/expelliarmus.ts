import {Entity, Player, Vector3} from "@minecraft/server";

export default function expelliarmus(direction : Vector3, caster: Player, target: Entity) {
    try {
        target.applyKnockback({x: direction.x * 10, z: direction.z * 10}, direction.y * 10);
    }
    catch (error) {
        // Skip
    }
}