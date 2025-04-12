import { system, MolangVariableMap } from "@minecraft/server";
import { handleSpellImpact } from "../spells/collisionHandler";
const passThroughBlocks = [
    "minecraft:water",
    "minecraft:lava",
    "minecraft:grass",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:fern",
    "minecraft:large_fern",
    "minecraft:dandelion",
    "minecraft:poppy",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:wither_rose",
    "minecraft:red_mushroom",
    "minecraft:brown_mushroom"
];
export function spawnMagicProjectile(caster, spellId) {
    const direction = caster.getViewDirection();
    const origin = caster.getHeadLocation();
    const dimension = caster.dimension;
    const pos = {
        x: origin.x + direction.x,
        y: origin.y + direction.y,
        z: origin.z + direction.z,
    };
    const projectile = dimension.spawnEntity("minecraft:armor_stand", pos);
    if (!projectile)
        return;
    // Rend invisible l'armor stand
    projectile.addEffect("invisibility", 600, { showParticles: false });
    projectile.nameTag = `spell:expelliarmus:${caster.name}`;
    projectile.addTag("witchcraft_projectile");
    const speed = 0.8;
    const lifetime = 100; // ticks
    const molangParticleColor = new MolangVariableMap();
    molangParticleColor.setColorRGB("variable.color", { red: 1, green: 0.8, blue: 1 }); // violet magique
    molangParticleColor.setFloat("variable.direction.x", direction.x);
    molangParticleColor.setFloat("variable.direction.y", direction.y);
    molangParticleColor.setFloat("variable.direction.z", direction.z);
    let age = 0;
    projectile.dimension.playSound("note.harp", projectile.location);
    // projectile.dimension.spawnParticle("minecraft:glow_particle", projectile.location, molangParticleColor);
    const interval = system.runInterval(() => {
        let hit;
        if (!projectile.isValid) {
            system.clearRun(interval);
            return;
        }
        // console.warn(`🔄 Tick ${age}`);
        age++;
        const currentPos = projectile.location;
        const nextPos = {
            x: currentPos.x + direction.x * speed,
            y: currentPos.y + direction.y * speed,
            z: currentPos.z + direction.z * speed,
        };
        // Try to summon particles at location
        try {
            projectile.dimension.spawnParticle("minecraft:glow_particle", nextPos, molangParticleColor);
            projectile.teleport(nextPos);
        }
        catch (e) {
            return;
        }
        // Try finding entity target
        try {
            // Collision avec entité
            hit = dimension.getEntities({
                location: nextPos,
                maxDistance: 1.5,
                excludeTypes: ["armor_stand"],
            }).find(e => e.id !== caster.id);
        }
        catch (e) {
            console.error(e);
            return;
        }
        if (hit) {
            console.log("Spell hit !");
            handleSpellImpact(direction, projectile, hit);
            if (projectile.isValid) {
                projectile.kill();
            }
            system.clearRun(interval);
        }
        // Try colliding with block
        try {
            // Collision avec bloc solide
            const block = dimension.getBlock(nextPos);
            if (block) {
                const type = block.typeId;
                const isSolid = type !== "minecraft:air";
                const passThrough = passThroughBlocks.includes(type);
                if (isSolid && !passThrough) {
                    console.log(`Projectile hit block: ${type}`);
                    if (projectile.isValid) {
                        projectile.kill();
                    }
                    system.clearRun(interval);
                }
            }
        }
        catch (e) {
            // Skip this tick
            return;
        }
        if (age > lifetime) {
            if (projectile.isValid) {
                projectile.kill();
            }
            system.clearRun(interval);
        }
    });
}
