import { BlockPermutation } from "@minecraft/server";
import { Spell, SpellIds } from "./Spell";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
import { playerData } from "../player/PlayerData";
export class ReparoSpell extends Spell {
    constructor(caster) {
        super(SpellIds.Reparo, "Reparo", "Répare les choses endommagées.", MinecraftTextColor.Green, caster);
    }
    cast() {
        if (!this.hasEnoughMana()) {
            this.caster.sendMessage("Not enough mana to cast this spell.");
            return;
        }
        const direction = this.caster.getViewDirection();
        const origin = this.caster.getHeadLocation();
        const hitEntity = this.caster.dimension.getEntitiesFromRay(origin, direction, { maxDistance: ReparoSpell.maxDistance })
            .filter(e => e.entity.typeId === "minecraft:iron_golem");
        if (hitEntity.length > 0) {
            const closest = hitEntity.reduce((prev, current) => current.distance < prev.distance ? current : prev);
            ReparoSpell.tryRepairEntity(this.caster, closest.entity);
            playerData.get(this.caster.id)?.decreaseMana(this.getManaCost());
            return;
        }
        // Raycast de 4 blocs devant le joueur
        const hitBlock = this.caster.dimension.getBlockFromRay(origin, direction, { maxDistance: ReparoSpell.maxDistance });
        if (hitBlock) {
            ReparoSpell.tryRepair(this.caster, hitBlock.block);
            playerData.get(this.caster.id)?.decreaseMana(this.getManaCost());
        }
    }
    static tryRepairEntity(caster, entity) {
        if (entity.typeId !== "minecraft:iron_golem") {
            caster.sendMessage("§7Cette entité ne peut pas être réparée.");
            return;
        }
        const health = entity.getComponent("minecraft:health");
        if (!health) {
            caster.sendMessage("§7Impossible d'accéder à la santé de l'entité.");
            return;
        }
        if (health.currentValue === health.effectiveMax) {
            caster.sendMessage("§7Ce golem est déjà en pleine forme !");
            return;
        }
        health.setCurrentValue(health.currentValue + 25);
        caster.sendMessage("§bReparo !");
        caster.playSound("random.anvil_use", { pitch: 1.3 });
    }
    static tryRepair(caster, block) {
        const id = block.typeId;
        const repairedId = this.repairs.get(id);
        if (!repairedId) {
            caster.sendMessage("§7Ce bloc ne peut pas être réparé.");
            return;
        }
        const permutation = block.permutation;
        const cardinal_direction = permutation.getState("minecraft:cardinal_direction");
        if (cardinal_direction === undefined)
            return;
        const newPermutation = BlockPermutation.resolve(repairedId, { "minecraft:cardinal_direction": cardinal_direction });
        caster.dimension.setBlockPermutation(block.location, newPermutation);
        caster.sendMessage("§bReparo !");
        caster.playSound("random.anvil_use", { pitch: 1.3 });
    }
    static getNonInteractableBlocks() {
        return Array.from(this.repairs.keys());
    }
    getManaCost() {
        return 75;
    }
}
ReparoSpell.maxDistance = 10;
ReparoSpell.repairs = new Map([
    ["minecraft:damaged_anvil", "minecraft:chipped_anvil"],
    ["minecraft:chipped_anvil", "minecraft:anvil"]
]);
