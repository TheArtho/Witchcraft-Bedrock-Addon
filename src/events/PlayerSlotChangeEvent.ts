import {Player, system, world} from "@minecraft/server";
import {CustomEvent} from "./CustomEvent";
import {CustomEventCallback} from "./CustomEventCallback";

interface SlotChangeData {
    player: Player;
    previousSlot: number;
    currentSlot: number;
}

export class PlayerSlotChangeEvent {
    private event = new CustomEvent<SlotChangeData>();
    private lastSlotMap = new Map<string, number>();
    private intervalId: number | undefined;

    constructor(private readonly tickRate = 2) {
        this.start();
    }

    private start() {
        if (this.intervalId !== undefined) return;

        this.intervalId = system.runInterval(() => {
            for (const player of world.getPlayers()) {
                const current = player.selectedSlotIndex;
                const last = this.lastSlotMap.get(player.id);

                if (last !== undefined && last !== current) {
                    this.event.trigger({ player, previousSlot: last, currentSlot: current });
                }

                this.lastSlotMap.set(player.id, current);
            }
        }, this.tickRate);
    }

    private stop() {
        if (this.intervalId !== undefined) {
            system.clearRun(this.intervalId);
            this.intervalId = undefined;
        }
    }

    subscribe(callback: CustomEventCallback<SlotChangeData>) {
        this.event.subscribe(callback);
    }

    unsubscribe(callback: CustomEventCallback<SlotChangeData>) {
        this.event.unsubscribe(callback);
    }
}
