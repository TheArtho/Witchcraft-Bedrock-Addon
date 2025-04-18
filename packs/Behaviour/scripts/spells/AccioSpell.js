import { MagicProjectileFlag, ProjectileSpell } from "./ProjectileSpell";
import { EntityComponentTypes, } from "@minecraft/server";
import { SpellIds } from "./Spell";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
export class AccioSpell extends ProjectileSpell {
    constructor(caster) {
        super(SpellIds.Accio, "Accio", "Attire un objet vers soi.", MinecraftTextColor.LightPurple, caster);
        this.flags = [MagicProjectileFlag.CanTouchItems];
    }
    onEntityHit(caster, target) {
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
    onBlockHit(caster, block) {
        try {
            // Check if the target is an item
            if (block.typeId === "minecraft:frame") {
                console.log(`item_frame_map_bit: ${block.permutation.getState('item_frame_map_bit')}`);
                console.log(`item_frame_photo_bit: ${block.permutation.getState('item_frame_photo_bit')}`);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    getManaCost() {
        return 20;
    }
}
