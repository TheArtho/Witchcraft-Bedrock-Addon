import { handlePotionUse } from "../../../items/manaPotion/ManaPotionLogic";
export function fillMana(player, args) {
    if (!player?.isOp()) {
        throw new Error("You don't have the permission to use that command.");
    }
    handlePotionUse(player, "witchcraft:potion_bottle_mana");
}
