import { world } from "@minecraft/server";
import { playerData } from "../player/PlayerData";
import { colorText } from "../utils/colorText";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
world.afterEvents.itemCompleteUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack.typeId;
    if (item === "witchcraft:potion_bottle_mana") {
        playerData.get(player.id)?.fillMana();
        player.sendMessage(colorText("Your mana has been filled.", MinecraftTextColor.Aqua));
    }
});
