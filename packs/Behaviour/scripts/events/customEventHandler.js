import { PlayerSlotChangeEventSignal } from "./PlayerSlotChangeEventSignal";
export const customEvents = {
    afterEvents: {
        playerSlotChange: new PlayerSlotChangeEventSignal(),
    }
};
