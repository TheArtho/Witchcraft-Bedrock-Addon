import { fillMana } from "./fillMana";
export const commandRegistry = new Map([
    ["fillMana", fillMana],
]);
export function handleCommand(name, player, args) {
    const command = commandRegistry.get(name);
    if (command) {
        command(player, args);
    }
}
