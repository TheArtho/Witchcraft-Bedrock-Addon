import { ProjectileSpell } from "./ProjectileSpell";
import { EntityComponentTypes, EquipmentSlot, ItemStack } from "@minecraft/server";
import { SpellIds } from "./Spell";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
export class Expelliarmus extends ProjectileSpell {
    constructor(caster) {
        super(SpellIds.Expelliarmus, "Expelliarmus", "Désarme la cible.", MinecraftTextColor.Red, caster);
    }
    onEntityHit(caster, target) {
        try {
            const equippableComponent = target.getComponent(EntityComponentTypes.Equippable);
            const item = equippableComponent?.getEquipment(EquipmentSlot.Mainhand);
            const itemSlot = equippableComponent?.getEquipmentSlot(EquipmentSlot.Mainhand);
            const droppedItem = target.dimension.spawnItem(item, target.getHeadLocation());
            const viewDirection = target.getViewDirection();
            itemSlot.setItem(new ItemStack("minecraft:air"));
            droppedItem.applyImpulse({
                x: viewDirection.x * 0.5,
                y: viewDirection.y * 0.5,
                z: viewDirection.z * 0.5
            });
        }
        catch (error) {
            // Skip
        }
    }
    getManaCost() {
        return 30;
    }
}
