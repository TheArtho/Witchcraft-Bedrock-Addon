import {Entity, Player} from "@minecraft/server";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

export enum SpellIds {
    Fail = -1,
    Leviosa,
    Lumos,
    Fulmen
}

export abstract class Spell {
    public readonly id: SpellIds;
    public readonly name: string;
    public readonly description?: string;
    public readonly color: MinecraftTextColor;

    protected constructor(id: SpellIds, name: string, description: string, color: MinecraftTextColor) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
    }

    abstract cast(caster: Player): void;

    onEntityHit?(caster: Player, target: Entity): void;
    onBlockHit?(caster: Player, blockTypeId: string): void;
}