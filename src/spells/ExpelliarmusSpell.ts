import {ProjectileSpell} from "./ProjectileSpell";
import {
    Entity,
    EntityComponentTypes,
    EquipmentSlot,
    ItemStack,
    Player,
} from "@minecraft/server";
import {SpellIds} from "./Spell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

export class ExpelliarmusSpell extends ProjectileSpell {

    constructor(caster: Player) {
        super(SpellIds.Expelliarmus, "Expelliarmus", "Désarme la cible.", MinecraftTextColor.Red, caster);
    }

    onEntityHit(caster: Player, target: Entity) {
        try {
            if (target instanceof Player) {
                const equippableComponent = target.getComponent(EntityComponentTypes.Equippable);
                const item = equippableComponent?.getEquipment(EquipmentSlot.Mainhand);
                const itemSlot = equippableComponent?.getEquipmentSlot(EquipmentSlot.Mainhand);

                if (!item) {
                    return;
                }

                const droppedItem = target.dimension.spawnItem(item, target.getHeadLocation());
                const viewDirection = target.getViewDirection();

                itemSlot?.setItem(new ItemStack("minecraft:air"));
                droppedItem.applyImpulse({
                    x: viewDirection.x * 0.5,
                    y: viewDirection.y * 0.5,
                    z: viewDirection.z * 0.5
                });
            }
            else {
                target.runCommand("replaceitem entity @s slot.weapon.mainhand 0 air")
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    getManaCost(): number {
        return 30;
    }
}