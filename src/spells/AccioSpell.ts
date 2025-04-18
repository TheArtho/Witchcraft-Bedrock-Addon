import {MagicProjectileFlag, ProjectileSpell} from "./ProjectileSpell";
import {
    Block, BlockStateType, BlockType, BlockTypes,
    Entity, EntityComponent,
    EntityComponentTypes, EntityItemComponent,
    EquipmentSlot,
    ItemStack,
    Player, world,
} from "@minecraft/server";
import {SpellIds} from "./Spell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";
import {MathUtils} from "../utils/MathUtils";

export class AccioSpell extends ProjectileSpell {

    constructor(caster: Player) {
        super(SpellIds.Accio, "Accio", "Attire un objet vers soi.", MinecraftTextColor.LightPurple, caster);
        this.flags = [MagicProjectileFlag.CanTouchItems]
    }

    onEntityHit(caster: Player, target: Entity) {
        try {
            // Check if the target is an item
            if (target.hasComponent(EntityComponentTypes.Item)) {
                // Simply teleport the item to the caster's location
                target.teleport(caster.location);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    onBlockHit(caster: Player, block: Block) {
        try {
            // Check if the target is an item
            if (block.typeId === "minecraft:frame") {
                console.log(`item_frame_map_bit: ${block.permutation.getState('item_frame_map_bit')}`)
                console.log(`item_frame_photo_bit: ${block.permutation.getState('item_frame_photo_bit')}`)
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    getManaCost(): number {
        return 20;
    }
}