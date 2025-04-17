import {Block, Entity, GameMode, Player} from "@minecraft/server";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";
import {activeSpells} from "../core/activeSpellManager";
import {playerData} from "../player/PlayerData";

export enum SpellIds {
    Fail = -1,
    Leviosa = 1,
    Lumos = 2,
    Fulmen = 3,
    Reparo = 4,
    Expelliarmus= 5
}

export abstract class Spell {
    public readonly id: SpellIds;
    public readonly name: string;
    public readonly description?: string;
    public readonly color: MinecraftTextColor;

    public readonly caster: Player;

    protected constructor(id: SpellIds, name: string, description: string, color: MinecraftTextColor, caster: Player) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;

        this.caster = caster;
    }

    setActiveSpell() {
        activeSpells.set(this.caster.id, this);
    }

    abstract cast(): void;

    abstract getManaCost() : number;

    protected hasEnoughMana() : Boolean {
        return this.caster.getGameMode() == GameMode.creative || playerData.get(this.caster.id)!.mana! - this.getManaCost() >= 0;
    }

    onEntityHit?(caster: Player, target: Entity): void;
    onBlockHit?(caster: Player, block : Block): void;
}