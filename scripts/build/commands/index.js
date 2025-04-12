import thunder from "./thunder";
export const commandRegistry = new Map([
    ["thunder", thunder],
]);
export function handleCommand(name, player, args) {
    const command = commandRegistry.get(name);
    if (command) {
        command(player);
    }
}
