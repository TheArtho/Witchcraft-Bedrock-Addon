import { playerData } from "../../player/PlayerData";
import { colorText } from "../../utils/colorText";
import { MinecraftTextColor } from "../../utils/MinecraftTextColor";
export function handlePotionUse(player, itemId) {
    if (itemId === "witchcraft:potion_bottle_mana") {
        playerData.get(player.id)?.fillMana();
        player.sendMessage(colorText("Your mana has been filled.", MinecraftTextColor.Aqua));
    }
}
