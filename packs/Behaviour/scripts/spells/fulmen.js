import { system } from "@minecraft/server";
export default function fulmen(projectile, direction, caster, target) {
    try {
        const posString = `${target.location.x} ${target.location.y} ${target.location.z}`;
        system.run(() => target.dimension.runCommand(`summon lightning_bolt ${posString}`));
    }
    catch (error) {
        // Skip
    }
}
