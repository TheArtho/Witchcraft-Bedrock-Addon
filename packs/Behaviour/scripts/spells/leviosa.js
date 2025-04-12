export default function leviosa(projectile, direction, caster, target) {
    try {
        target.applyKnockback({ x: 0, z: 0 }, 1);
    }
    catch (error) {
        // Skip
    }
}
