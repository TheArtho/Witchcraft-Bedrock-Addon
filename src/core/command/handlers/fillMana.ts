import {Player} from "@minecraft/server";
import {handlePotionUse} from "../../../items/manaPotion/ManaPotionLogic";

export function fillMana(player: Player, args?: string[]) {
    if (!player?.inputPermissions) {
        throw new Error("You don't have the permission to use that command.")
    }
    handlePotionUse(player, "witchcraft:potion_bottle_mana");
}