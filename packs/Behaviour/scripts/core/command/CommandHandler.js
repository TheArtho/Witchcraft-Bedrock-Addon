import { fillMana } from "./handlers/fillMana";
import { expelliarmus } from "./handlers/expelliarmus";
export class CommandHandler {
    static register() {
        this.commands.set("fillMana", fillMana);
        this.commands.set("expelliarmus", expelliarmus);
    }
    static execute(commandName, player, args) {
        const command = this.commands.get(commandName);
        if (command) {
            try {
                command(player, args);
            }
            catch (e) {
                player.sendMessage(`§c${e}`);
            }
        }
        else {
            player.sendMessage(`§cUnknown command : !${commandName}`);
        }
    }
}
CommandHandler.commands = new Map();
