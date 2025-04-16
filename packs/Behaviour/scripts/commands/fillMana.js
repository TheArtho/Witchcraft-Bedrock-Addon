import { playerData } from "../player/PlayerData";
export function fillMana(player, args) {
    if (player?.isOp()) {
        playerData.get(player.id)?.fillMana();
    }
}
