import { Player } from "@minecraft/server";
import thunder from "./thunder";

export const commandRegistry = new Map([
    ["thunder", thunder],
]);

export function handleCommand(name: string, player: Player, args: string[]) {
    const command = commandRegistry.get(name);
    if (command) {
      command(player);
    }
  }