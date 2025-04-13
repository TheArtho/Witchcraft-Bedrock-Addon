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
        const durationTicks = 200; // 10 seconds
        let age = 0;
        const getLightPos = () => {
            const loc = caster.location;
            return {
                x: Math.floor(loc.x),
                y: Math.floor(loc.y + 1.5),
                z: Math.floor(loc.z)
            };
        };
        const setLightBlock = (pos) => {
            const block = caster.dimension.getBlock(pos);
            if (block?.typeId === "minecraft:air") {
                caster.dimension.setBlockType(pos, "minecraft:light_block_15");
            }
        };
        const clearLightBlock = (pos) => {
            const block = caster.dimension.getBlock(pos);
            if (block?.typeId === "minecraft:light_block_15") {
                caster.dimension.setBlockType(pos, "minecraft:air");
            }
        };
        let previousPos = getLightPos();
        setLightBlock(previousPos); // Initial light block
        const interval = system.runInterval(() => {
            if (!caster.isValid) {
                system.clearRun(interval);
                return;
            }
            const currentPos = getLightPos();
            // If player moved to a new block position
            if (currentPos.x !== previousPos.x ||
                currentPos.y !== previousPos.y ||
                currentPos.z !== previousPos.z) {
                setLightBlock(currentPos); // Place new light block
                clearLightBlock(previousPos); // Remove previous one
                previousPos = currentPos;
            }
            age++;
            if (age >= durationTicks) {
                clearLightBlock(currentPos); // Clean up final light block
                caster.playSound("random.orb", { pitch: 0.5, volume: 0.5 }); // End sound
                system.clearRun(interval);
            }
        });
    }
}
