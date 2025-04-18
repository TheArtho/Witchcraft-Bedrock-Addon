import { system, world } from "@minecraft/server";
import { ExpelliarmusSpell } from "../spells/ExpelliarmusSpell";
export function expelliarmus(player, args) {
    if (args === undefined || args?.length < 0) {
        player.sendMessage("Command error: missing argument player.");
        return;
    }
    if (args?.length < 1) {
        player.sendMessage("Command error: Too many arguments.");
        return;
    }
    const target = world.getPlayers().find((player) => player.name === args[0]);
    if (!target) {
        player.sendMessage(`Command error: Player ${args[0]} doesn't exist`);
        return;
    }
    const spell = new ExpelliarmusSpell(player);
    system.run(() => spell.onEntityHit(player, target));
}
