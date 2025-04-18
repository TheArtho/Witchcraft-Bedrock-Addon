import {Spell, SpellIds} from "./Spell";
import {Dimension, Entity, GameMode, Player, system, Vector3, world} from "@minecraft/server";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";
import {PersistentSpell} from "./PersistentSpell";
import {playerData} from "../player/PlayerData";
import {activeSpells} from "../core/activeSpellManager";

export class LumosSpell extends Spell implements PersistentSpell {

    entity: Entity | null = null;
    interval: any;
    previousPos: Vector3 | null = null;
    isActive: Boolean = false;
    dimension: Dimension;

    constructor(caster: Player) {
        super(SpellIds.Lumos, "Lumos", "Éclaire autour de l'utilisateur.", MinecraftTextColor.Gold, caster);
        this.dimension = this.caster.dimension;
    }

    cast(): void {
        try {
            if (!this.hasEnoughMana()) {
                this.caster.sendMessage("Not enough mana to cast this spell.")
                activeSpells.delete(this.caster.id);
                return;
            }

            if (!this.isActive) {
                this.caster.sendMessage("§eLumos!");
                this.caster.playSound("random.orb", { pitch: 1, volume: 0.5 });
                this.start();
            }
            else {
                this.stop()
            }
        }
        catch (e) {
            // Skip
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

        if (this.entity) {
            this.entity.nameTag = `lumos:${this.caster.id}`;
        }

        let leaveEvent = (event : any) => {
            if (event.playerId !== this.caster.id) return;

            system.run(() => {
                world.beforeEvents.playerLeave.unsubscribe(leaveEvent);
                this.stop();
            })
        }

        world.beforeEvents.playerLeave.subscribe(leaveEvent);

        this.interval = system.runInterval(() => {
            if (!this.isActive) return;

            if (!this.caster.isValid) {
                this.stop();
                return;
            }

            const currentPos = this.findLightPlacement(this.caster, this.previousPos);

            if (currentPos) {
                if (!this.samePosition(currentPos, this.previousPos)) {
                    this.setLightBlock(currentPos, this.caster);
                    if (this.previousPos) {
                        this.clearLightBlock(this.previousPos, this.dimension);
                    }
                    this.previousPos = currentPos;
                }
            } else if (this.previousPos) {
                // No valid light position found, clear previous one
                this.clearLightBlock(this.previousPos, this.dimension);
                this.previousPos = null;
            }

            // Decrease the mana
            playerData.get(this.caster.id)!.decreaseMana(this.getManaCost());

            if (!this.hasEnoughMana()) {
                this.stop()
            }
        }, 5);
    }

    stop(): void {
        if (!this.isActive) return;

        let blockHasBeenCleared;

        this.isActive = false;

        if (this.interval) {
            system.clearRun(this.interval);
            this.interval = undefined;
        }

        if (this.dimension) {
            if (this.previousPos) {
                blockHasBeenCleared = this.clearLightBlock(this.previousPos, this.dimension);
                this.previousPos = null;
            }
            if (blockHasBeenCleared) {
                if (this.entity?.isValid) {
                    this.entity.triggerEvent("minecraft:despawn_now");
                }
            }
        }

        try {
            activeSpells.delete(this.caster.id);
        }
        catch (e) {
            // Skip
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

    private clearLightBlock(pos: Vector3, dimension: Dimension): Boolean {
        const block = dimension.getBlock(pos);
        if (block?.typeId === "minecraft:light_block_15") {
            dimension.setBlockType(pos, "minecraft:air");
            return dimension.getBlock(pos)?.typeId === "minecraft:air";
        }
        return false;
    }

    private samePosition(a: Vector3 | null, b: Vector3 | null): boolean {
        if (!a || !b) return false;
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }

    private registerLightPosition(pos: Vector3) {
        this.entity?.teleport(pos);
    }

    getManaCost(): number {
        return 1;
    }
}
