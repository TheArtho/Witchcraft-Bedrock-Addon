// handlers/CommandHandler.ts
import {CommandFunction} from "./types";
import {fillMana} from "./handlers/fillMana";
import {expelliarmus} from "./handlers/expelliarmus";
import {Player} from "@minecraft/server";

export class CommandHandler {
    private static commands = new Map<string, CommandFunction>([
        ["fillMana", fillMana],
        ["expelliarmus", expelliarmus],
    ])

    static execute(commandName: string, player : Player, args?: string[]) {
        const command = this.commands.get(commandName);
        if (command) {
            try {
                command(player, args);
            }
            catch (e) {
                player.sendMessage(`§c${e}`);
            }
        } else {
            player.sendMessage(`§cUnknown command : !${commandName}`);
        }
    }
}
