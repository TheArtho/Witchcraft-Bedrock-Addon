import { Spell, SpellIds } from "./Spell";
import { system } from "@minecraft/server";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
export class LumosSpell extends Spell {
    constructor() {
        super(SpellIds.Lumos, "Lumos", "Éclaire autour de l'utilisateur.", MinecraftTextColor.Gold);
    }
    cast(caster) {
        caster.sendMessage("§eLumos!");
        caster.playSound("random.orb", { pitch: 1, volume: 0.5 });
        const durationTicks = 200;
        let age = 0;
        let previousPos = this.findLightPlacement(caster, null);
        if (previousPos) {
            this.setLightBlock(previousPos, caster.dimension);
        }
        const interval = system.runInterval(() => {
            if (!caster.isValid) {
                system.clearRun(interval);
                return;
            }
            const currentPos = this.findLightPlacement(caster, previousPos);
            if (currentPos) {
                if (!this.samePosition(currentPos, previousPos)) {
                    this.setLightBlock(currentPos, caster.dimension);
                    if (previousPos) {
                        this.clearLightBlock(previousPos, caster.dimension);
                    }
                    previousPos = currentPos;
                }
            }
            else if (previousPos) {
                // No valid light position found, clear previous one
                this.clearLightBlock(previousPos, caster.dimension);
                previousPos = null;
            }
            age++;
            if (age >= durationTicks) {
                if (previousPos) {
                    this.clearLightBlock(previousPos, caster.dimension);
                }
                caster.playSound("random.orb", { pitch: 0.5, volume: 0.5 });
                system.clearRun(interval);
            }
        });
    }
    findLightPlacement(player, previousPos) {
        const dim = player.dimension;
        // Fallback to finding a new empty/lightable position
        const base = player.location;
        const basePos = {
            x: Math.floor(base.x),
            y: Math.floor(base.y + 1.5), // add 1.5 to reach the head location
            z: Math.floor(base.z)
        };
        const offsets = [
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 2, z: 0 },
            { x: 1, y: 1, z: 0 },
            { x: -1, y: 1, z: 0 },
            { x: 0, y: 1, z: 1 },
            { x: 0, y: 1, z: -1 }
        ];
        // Sweep around the base position if needed
        for (const offset of offsets) {
            const pos = {
                x: basePos.x + offset.x,
                y: basePos.y + offset.y,
                z: basePos.z + offset.z
            };
            // If previous block is still a valid light block, reuse it
            if (previousPos) {
                if (this.samePosition(pos, previousPos)) {
                    return previousPos;
                }
            }
            const block = dim.getBlock(pos);
            if (block?.typeId === "minecraft:air") {
                return pos;
            }
        }
        return null;
    }
    setLightBlock(pos, dimension) {
        const block = dimension.getBlock(pos);
        if (block?.typeId === "minecraft:air") {
            dimension.setBlockType(pos, "minecraft:light_block_15");
        }
    }
    clearLightBlock(pos, dimension) {
        const block = dimension.getBlock(pos);
        if (block?.typeId === "minecraft:light_block_15") {
            dimension.setBlockType(pos, "minecraft:air");
        }
    }
    samePosition(a, b) {
        if (!a || !b)
            return false;
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }
}
