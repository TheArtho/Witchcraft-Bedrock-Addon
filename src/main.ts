import "./items/wand";
import "./events/customEventHandler"
import {customEvents} from "./events/customEventHandler";

customEvents.playerSlotChange.subscribe(event => {
    console.log(`${event.player.name} changed slot from ${event.previousSlot} to ${event.currentSlot}`);
})