import {Player, system, world} from "@minecraft/server";
import {playerData} from "../../../player/PlayerData";
import {ExpelliarmusSpell} from "../../../spells/ExpelliarmusSpell";

export function expelliarmus(player: Player, args?: string[]) {
    if (!player?.isOp()) {
        throw new Error("You don't have the permission to use that command.")
    }
    if (args === undefined || args?.length < 0) {
        player.sendMessage("Command error: missing argument player.")
        return;
    }
    if (args?.length < 1) {
        player.sendMessage("Command error: Too many arguments.")
        return;
    }
    const target = world.getPlayers().find((player) => player.name === args![0])
    if (!target) {
        player.sendMessage(`Command error: Player ${args[0]} doesn't exist`)
        return;
    }
    const spell = new ExpelliarmusSpell(player);
    system.run(() => spell.onEntityHit(player, target))
}