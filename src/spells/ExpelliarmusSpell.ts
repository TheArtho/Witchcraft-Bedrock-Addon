import {ProjectileSpell} from "./ProjectileSpell";
import {
    Entity,
    EntityComponentTypes,
    EquipmentSlot,
    ItemStack,
    Player, world,
} from "@minecraft/server";
import {SpellIds} from "./Spell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";
import {MathUtils} from "../utils/MathUtils";

export class ExpelliarmusSpell extends ProjectileSpell {

    constructor(caster: Player) {
        super(SpellIds.Expelliarmus, "Expelliarmus", "Désarme la cible.", MinecraftTextColor.Red, caster);
    }

    clampViewDirection(viewDirection: { x: number; y: number; z: number }) {
        const clampedY = Math.max(0, viewDirection.y); // empêche de pointer vers le bas

        // On normalise le vecteur après avoir modifié le Y pour garder une direction valide
        const length = Math.sqrt(viewDirection.x ** 2 + clampedY ** 2 + viewDirection.z ** 2);

        return {
            x: viewDirection.x / length,
            y: clampedY / length,
            z: viewDirection.z / length
        };
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

                const headLocation = target.getHeadLocation()
                const viewDirection = target.getViewDirection();
                const safeViewDirection = this.clampViewDirection(viewDirection);
                const dropPosition = {
                    x: headLocation.x + safeViewDirection.x * 2,
                    y: headLocation.y + safeViewDirection.y * 2,
                    z: headLocation.z + safeViewDirection.z * 2
                };

                const droppedItem = target.dimension.spawnItem(item, dropPosition);

                itemSlot?.setItem(new ItemStack("minecraft:air"));
                droppedItem.applyImpulse({
                    x: safeViewDirection.x * 0.5,
                    y: safeViewDirection.y,
                    z: safeViewDirection.z * 0.5
                });

                const randomPitch = MathUtils.mapRange(Math.random(), 0, 1, 0.5, 0.8);

                caster.playSound("random.pop", {location: headLocation, volume: 0.4, pitch: randomPitch})
                target.playSound("random.pop", {volume: 0.4, pitch: randomPitch})
            }
            /*
            else {
                target.runCommand("replaceitem entity @s slot.weapon.mainhand 0 air")

                const headLocation = target.getHeadLocation()
                const viewDirection = target.getViewDirection();
                const dropPosition = {
                    x: headLocation.x + viewDirection.x * 0.5,
                    y: headLocation.y + viewDirection.y * 0.5,
                    z: headLocation.z + viewDirection.z * 0.5
                }

                const droppedItem = target.dimension.spawnItem(new ItemStack("minecraft:bow"), dropPosition);
                droppedItem.applyImpulse({
                    x: viewDirection.x * 0.5,
                    y: viewDirection.y * 0.5,
                    z: viewDirection.z * 0.5
                });
            }
            */
        }
        catch (error) {
            console.error(error);
        }
    }

    getManaCost(): number {
        return 30;
    }
}