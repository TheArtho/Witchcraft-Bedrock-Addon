import {Entity, Player, Vector3} from "@minecraft/server";
import expelliarmus from "./expelliarmus";
// import leviosa from "./leviosa";

const spellMap: Record<string, (direction : Vector3, caster: Player, target: Entity) => void> = {
    expelliarmus,
    // leviosa,
};

export function handleSpellImpact(direction : Vector3, projectile: Entity, target: Entity) {
    const parts = projectile.nameTag.split(":");
    const spellId = parts[1];
    const casterName = parts[2];

    const caster = projectile.dimension.getPlayers().find(p => p.name === casterName);
    if (!caster) return;

    const spell = spellMap[spellId];
    if (!spell) return;

    projectile.dimension.spawnParticle("minecraft:large_explosion", projectile.location);
    projectile.dimension.playSound("firework.blast", projectile.location);

    // Exécute le sort
    spell(direction, caster, target);
}
