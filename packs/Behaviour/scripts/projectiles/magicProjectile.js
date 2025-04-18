import { system } from "@minecraft/server";
import { MagicProjectileFlag } from "../spells/ProjectileSpell";
import { spellIdToString } from "../spells/spellRegistry";
const passThroughBlocks = [
    "minecraft:water",
    "minecraft:lava",
    "minecraft:bush",
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
export function spawnMagicProjectile(caster, spell, flags) {
    const direction = caster.getViewDirection();
    const origin = caster.getHeadLocation();
    const dimension = caster.dimension;
    const particleName = "minecraft:endrod";
    const pos = {
        x: origin.x + direction.x,
        y: origin.y + direction.y,
        z: origin.z + direction.z,
    };
    // @ts-ignore
    const projectile = dimension.spawnEntity("witchcraft:spell_projectile", pos);
    if (!projectile)
        return;
    // Rend invisible l'armor stand
    projectile.addEffect("invisibility", 600, { showParticles: false });
    projectile.nameTag = `spell:${spellIdToString(spell.id)}:${caster.name}`;
    projectile.addTag("witchcraft_projectile");
    const speed = 0.8;
    const lifetime = 100; // ticks
    let age = 0;
    projectile.dimension.playSound("note.harp", projectile.location);
    projectile.dimension.spawnParticle(particleName, projectile.location);
    let excludeEntityTypes = [];
    if (flags) {
        if (!flags.includes(MagicProjectileFlag.CanTouchItems)) {
            excludeEntityTypes.push("item");
        }
    }
    const interval = system.runInterval(() => {
        let hit;
        if (!projectile.isValid) {
            system.clearRun(interval);
            try {
                projectile.kill();
            }
            catch (e) {
                // Skip
            }
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
            projectile.dimension.spawnParticle(particleName, nextPos);
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
                maxDistance: 2,
                excludeFamilies: ["projectile"],
                excludeTypes: excludeEntityTypes
            }).find(e => e.id !== caster.id);
        }
        catch (e) {
            // Skip this tick
            return;
        }
        if (hit) {
            spell.onEntityHit?.(caster, hit);
            if (projectile.isValid) {
                projectile.triggerEvent("minecraft:despawn_now");
            }
            system.clearRun(interval);
        }
        // Try colliding with block
        try {
            // Collision avec bloc solide
            const block = dimension.getBlock(nextPos);
            if (block) {
                const type = block.typeId;
                const isSolid = !block.isAir;
                const passThrough = passThroughBlocks.includes(type);
                if (isSolid && !passThrough) {
                    // console.log(`Projectile hit block: ${type}`);
                    spell.onBlockHit?.(caster, block);
                    if (projectile.isValid) {
                        projectile.triggerEvent("minecraft:despawn_now");
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
                projectile.triggerEvent("minecraft:despawn_now");
            }
            system.clearRun(interval);
        }
    });
}
