import { world } from "@minecraft/server";
import { handleCommand } from "../commands/index";
world.beforeEvents.chatSend.subscribe((event) => {
    // Check for custom command syntax
    if (event.message.startsWith('!')) {
        const strings = event.message.trim().replace('!', '').split(' ');
        if (strings.length == 0) {
            return;
        }
        const args = strings.slice(1);
        try {
            handleCommand(strings[0], event.sender, args);
        }
        catch (e) {
            event.sender.sendMessage(`Error with command !${strings[0]}. ${e}`);
        }
        // event.cancel = true;
    }
});
