import { system, world } from "@minecraft/server";
const listeners = [];
const lastSlotMap = new Map();
export const slotChangeEvents = {
    subscribe(callback) {
        listeners.push(callback);
    },
    unsubscribe(callback) {
        const i = listeners.indexOf(callback);
        if (i !== -1)
            listeners.splice(i, 1);
    }
};
// Detection of the event
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const current = player.selectedSlotIndex;
        const last = lastSlotMap.get(player.id);
        if (last !== undefined && last !== current) {
            for (const callback of listeners) {
                callback(player, last, current);
            }
        }
        lastSlotMap.set(player.id, current);
    }
}, 2); // every 2 ticks
