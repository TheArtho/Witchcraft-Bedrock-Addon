import { Spell, SpellIds } from "./Spell";
import {Dimension, Entity, Player, PlayerLeaveBeforeEvent, system, Vector3, world} from "@minecraft/server";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
import {activeSpells} from "../core/activeSpellManager";
import {PersistentSpell} from "./PersistentSpell";

export class LumosSpell extends Spell implements PersistentSpell {

    entity: Entity | null = null;
    interval: any;
    previousPos: Vector3 | null = null;
    isActive: Boolean = false;

    constructor(caster: Player) {
        super(SpellIds.Lumos, "Lumos", "Éclaire autour de l'utilisateur.", MinecraftTextColor.Gold, caster);
    }

    cast(): void {
        if (!this.isActive) {
            this.caster.sendMessage("§eLumos!");
            this.caster.playSound("random.orb", { pitch: 1, volume: 0.5 });
            this.start();
        }
        else {
            this.stop()
        }
    }

    private start(): void {
        if (this.isActive) return;
        this.isActive = true;

        // @ts-ignore
        this.entity = this.caster.dimension.spawnEntity("witchcraft:lumos_entity", this.caster.location)

        this.previousPos = this.findLightPlacement(this.caster, null);
        if (this.previousPos) {
            this.setLightBlock(this.previousPos, this.caster);
        }

        this.entity?.addTag(`lumos:${this.caster.id}`)

        this.interval = system.runInterval(() => {
            if (!this.isActive) return;

            if (!this.caster.isValid) {
                console.log(`[Witchcraft] ${this.caster.name} disconnected, cleaning the lumos light...`)
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
            } else if (this.previousPos) {
                // No valid light position found, clear previous one
                this.clearLightBlock(this.previousPos, this.caster.dimension);
                this.previousPos = null;
            }
        });
    }

    stop(): void {
        if (!this.isActive) return;
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

    private findLightPlacement(player: Player, previousPos : Vector3 | null): Vector3 | null {
        const dim = player.dimension;

        // Fallback to finding a new empty/lightable position
        const base = player.location;
        const basePos = {
            x: Math.floor(base.x),
            y: Math.floor(base.y + 1.5),    // add 1.5 to reach the head location
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
            const pos: Vector3 = {
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

    private setLightBlock(pos: Vector3, caster: Player): void {
        const dimension = caster.dimension;
        const block = dimension.getBlock(pos);
        if (block?.typeId === "minecraft:air") {
            dimension.setBlockType(pos, "minecraft:light_block_15");
            this.registerLightPosition(pos);
        }
    }

    private clearLightBlock(pos: Vector3, dimension: Dimension): void {
        const block = dimension.getBlock(pos);
        if (block?.typeId === "minecraft:light_block_15") {
            dimension.setBlockType(pos, "minecraft:air");
        }
    }

    private samePosition(a: Vector3 | null, b: Vector3 | null): boolean {
        if (!a || !b) return false;
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }

    private registerLightPosition(pos: Vector3) {
        this.entity?.teleport(pos);
    }
}
