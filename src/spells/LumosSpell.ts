import { Spell, SpellIds } from "./Spell";
import {Dimension, Entity, Player, PlayerLeaveBeforeEvent, system, Vector3, world} from "@minecraft/server";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";;

export class LumosSpell extends Spell {

    entity: Entity | null = null;

    constructor() {
        super(SpellIds.Lumos, "Lumos", "Éclaire autour de l'utilisateur.", MinecraftTextColor.Gold);
    }

    cast(caster: Player): void {
        caster.sendMessage("§eLumos!");
        caster.playSound("random.orb", { pitch: 1, volume: 0.5 });

        const durationTicks = 200;
        let age = 0;

        let previousPos: Vector3 | null = this.findLightPlacement(caster, null);
        if (previousPos) {
            this.setLightBlock(previousPos, caster);
        }

        const playerLeaveEvent = (event: PlayerLeaveBeforeEvent) => {
            system.run(() => {
                if (caster.id == event.player.id && previousPos) {

                    this.clearLightBlock(previousPos!, caster.dimension);
                }
                if (this.entity && this.entity.isValid) {
                    this.entity.triggerEvent("minecraft:despawn_now")
                }
            });
            if (interval) {
                system.clearRun(interval);
            }
        };

        // @ts-ignore
        this.entity = caster.dimension.spawnEntity("witchcraft:lumos_entity", previousPos ?? caster.location)
        this.entity.addTag(`lumos:${caster.id}`)

        // Subscribe an event
        world.beforeEvents.playerLeave.subscribe(playerLeaveEvent);

        const interval = system.runInterval(() => {
            if (!caster.isValid) {
                if (previousPos) {
                    this.clearLightBlock(previousPos, caster.dimension);
                }
                if (this.entity && this.entity.isValid) {
                    this.entity.triggerEvent("minecraft:despawn_now")
                }
                world.beforeEvents.playerLeave.unsubscribe(playerLeaveEvent);
                system.clearRun(interval);
                return;
            }

            const currentPos = this.findLightPlacement(caster, previousPos);

            if (currentPos) {
                if (!this.samePosition(currentPos, previousPos)) {
                    this.setLightBlock(currentPos, caster);
                    if (previousPos) {
                        this.clearLightBlock(previousPos, caster.dimension);
                    }
                    previousPos = currentPos;
                }
            } else if (previousPos) {
                // No valid light position found, clear previous one
                this.clearLightBlock(previousPos, caster.dimension);
                previousPos = null;
            }

            age++;
            if (age >= durationTicks) {
                caster.playSound("random.orb", { pitch: 0.5, volume: 0.5 });
                if (previousPos) {
                    this.clearLightBlock(previousPos, caster.dimension);
                }
                if (this.entity && this.entity.isValid) {
                    this.entity.triggerEvent("minecraft:despawn_now")
                }
                world.beforeEvents.playerLeave.unsubscribe(playerLeaveEvent);
                system.clearRun(interval);
            }
        });
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
