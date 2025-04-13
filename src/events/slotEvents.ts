import { Player, system, world } from "@minecraft/server";

type SlotChangeCallback = (player: Player, from: number, to: number) => void;

const listeners: SlotChangeCallback[] = [];
const lastSlotMap = new Map<string, number>();

export const slotChangeEvents = {
    subscribe(callback: SlotChangeCallback) {
        listeners.push(callback);
    },
    unsubscribe(callback: SlotChangeCallback) {
        const i = listeners.indexOf(callback);
        if (i !== -1) listeners.splice(i, 1);
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
