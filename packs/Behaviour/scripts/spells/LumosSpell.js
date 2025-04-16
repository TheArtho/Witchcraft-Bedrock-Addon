import { Spell, SpellIds } from "./Spell";
import { system } from "@minecraft/server";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
import { playerData } from "../player/PlayerData";
export class LumosSpell extends Spell {
    constructor(caster) {
        super(SpellIds.Lumos, "Lumos", "Éclaire autour de l'utilisateur.", MinecraftTextColor.Gold, caster);
        this.entity = null;
        this.previousPos = null;
        this.isActive = false;
        this.manaCost = 1;
    }
    cast() {
        try {
            if (!this.hasEnoughMana()) {
                this.caster.sendMessage("Not enough mana to cast this spell.");
                return;
            }
            if (!this.isActive) {
                this.caster.sendMessage("§eLumos!");
                this.caster.playSound("random.orb", { pitch: 1, volume: 0.5 });
                this.start();
            }
            else {
                this.stop();
            }
        }
        catch (e) {
            // Skip
        }
    }
    start() {
        if (this.isActive)
            return;
        this.isActive = true;
        // @ts-ignore
        this.entity = this.caster.dimension.spawnEntity("witchcraft:lumos_entity", this.caster.location);
        this.previousPos = this.findLightPlacement(this.caster, null);
        if (this.previousPos) {
            this.setLightBlock(this.previousPos, this.caster);
        }
        this.entity?.addTag(`lumos:${this.caster.id}`);
        this.interval = system.runInterval(() => {
            if (!this.isActive)
                return;
            if (!this.caster.isValid) {
                console.log(`[Witchcraft] ${this.caster.name} disconnected, cleaning the lumos light...`);
                this.stop();
                return;
            }
            const currentPos = this.findLightPlacement(this.caster, this.previousPos);
            if (currentPos) {
                if (!this.samePosition(currentPos, this.previousPos)) {
                    this.setLightBlock(currentPos, this.caster);
                    if (this.previousPos) {
                        this.clearLightBlock(this.previousPos, this.caster.dimension);
                    }
                    this.previousPos = currentPos;
                }
            }
            else if (this.previousPos) {
                // No valid light position found, clear previous one
                this.clearLightBlock(this.previousPos, this.caster.dimension);
                this.previousPos = null;
            }
            // Decrease the mana
            playerData.get(this.caster.id)?.decreaseMana(this.manaCost);
            if (!this.hasEnoughMana()) {
                this.stop();
            }
        }, 5);
    }
    stop() {
        if (!this.isActive)
            return;
        this.isActive = false;
        if (this.interval) {
            system.clearRun(this.interval);
            this.interval = undefined;
        }
        if (this.entity?.isValid) {
            this.entity.triggerEvent("minecraft:despawn_now");
        }
        if (this.previousPos) {
            this.clearLightBlock(this.previousPos, this.caster.dimension);
            this.previousPos = null;
        }
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
        // TODO Adapt the offset closest position depending on where you are placed inside the block
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
    setLightBlock(pos, caster) {
        const dimension = caster.dimension;
        const block = dimension.getBlock(pos);
        if (block?.typeId === "minecraft:air") {
            dimension.setBlockType(pos, "minecraft:light_block_15");
            this.registerLightPosition(pos);
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
    registerLightPosition(pos) {
        this.entity?.teleport(pos);
    }
    hasEnoughMana() {
        return playerData.get(this.caster.id).mana - this.manaCost >= 0;
    }
}
