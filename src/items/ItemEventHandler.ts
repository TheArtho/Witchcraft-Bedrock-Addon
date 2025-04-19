import {WandEventHandler} from "./wand/WandEventHandler";
import {ManaPotionEventHandler} from "./manaPotion/ManaPotionEventHandler";

export class ItemEventHandler {
    static register(): void {
        // Register all item events
        WandEventHandler.register();
        ManaPotionEventHandler.register();
    }
}