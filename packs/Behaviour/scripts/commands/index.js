import { fillMana } from "./fillMana";
import { expelliarmus } from "./expelliarmus";
export const commandRegistry = new Map([
    ["fillMana", fillMana],
    ["expelliarmus", expelliarmus]
]);
export function handleCommand(name, player, args) {
    const command = commandRegistry.get(name);
    if (command) {
        command(player, args);
    }
}
