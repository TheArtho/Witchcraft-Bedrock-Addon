import {ItemEventHandler} from "./items/ItemEventHandler";
import {SaveEventHandler} from "./core/save/SaveEventHandler";
import {CommandEventHandler} from "./core/command/CommandEventHandler";
import {InitEventHandler} from "./core/InitEventHandler";
import {InitManager} from "./core/InitManager";
import {UiEventHandler} from "./ui/UiEventHandler";

// Main class
class Game {
    static initialize(): void {
        this.registerEvents();
        InitManager.initialize();
    }

    private static registerEvents(): void {
        // Initialize events
        InitEventHandler.register();
        // Command events
        CommandEventHandler.register();
        // Save events
        SaveEventHandler.register();
        // Item events
        ItemEventHandler.register();
        // UI events
        UiEventHandler.register();
    }
}

// Game Initialization
Game.initialize();
