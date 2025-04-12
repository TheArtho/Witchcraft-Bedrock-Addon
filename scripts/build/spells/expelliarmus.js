export default function expelliarmus(direction, caster, target) {
    try {
        target.applyKnockback({ x: direction.x * 10, z: direction.z * 10 }, direction.y * 10);
    }
    catch (error) {
        // Skip
    }
}
