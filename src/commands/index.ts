import { Player } from "@minecraft/server";
import {fillMana} from "./fillMana";

export const commandRegistry = new Map([
    ["fillMana", fillMana],
]);

export function handleCommand(name: string, player: Player, args?: string[]) {
    const command = commandRegistry.get(name);
    if (command) {
      command(player, args);
    }
}