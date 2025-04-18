import { Player } from "@minecraft/server";
import {fillMana} from "./fillMana";
import {expelliarmus} from "./expelliarmus";

export const commandRegistry = new Map([
    ["fillMana", fillMana],
    ["expelliarmus", expelliarmus]
]);

export function handleCommand(name: string, player: Player, args?: string[]) {
    const command = commandRegistry.get(name);
    if (command) {
      command(player, args);
    }
}