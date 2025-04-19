// logic/ManaPotionLogic.ts
import { Player } from "@minecraft/server";
import { playerData } from "../../player/PlayerData";
import { colorText } from "../../utils/colorText";
import { MinecraftTextColor } from "../../utils/MinecraftTextColor";

export function handlePotionUse(player: Player, itemId: string) {
    if (itemId === "witchcraft:potion_bottle_mana") {
        playerData.get(player.id)?.fillMana();
        player.sendMessage(colorText("Your mana has been filled.", MinecraftTextColor.Aqua));
    }
}
