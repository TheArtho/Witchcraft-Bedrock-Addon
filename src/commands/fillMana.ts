import {Player} from "@minecraft/server";
import {playerData} from "../player/PlayerData";

export function fillMana(player: Player, args?: string[]) {
    if (player?.isOp()) {
        playerData.get(player.id)?.fillMana();
    }
}