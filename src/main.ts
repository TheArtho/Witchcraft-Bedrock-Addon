import { world, GameMode } from "@minecraft/server";
import { playerData } from "./player/PlayerData";
import {ItemEventHandler} from "./items/ItemEventHandler";
import {SaveEventHandler} from "./core/save/SaveEventHandler";
import {CommandEventHandler} from "./core/command/CommandEventHandler";
import {InitEventHandler} from "./core/InitEventHandler";
import {InitManager} from "./core/InitManager";
import {CommandHandler} from "./core/command/CommandHandler";

// Main class
class Game {
    static initialize(): void {
        this.registerEvents();
        InitManager.initialize();
    }

    private static registerEvents(): void {
        // Register commands
        CommandHandler.register();

        // Initialize events
        InitEventHandler.register();
        // Command events
        CommandEventHandler.register();
        // Save events
        SaveEventHandler.register();
        // Item events
        ItemEventHandler.register();
        // Other events
        world.beforeEvents.playerGameModeChange.subscribe(this.handleGameModeChange);
    }

    private static handleGameModeChange(event: any): void {
        const allowedModes = [GameMode.survival, GameMode.adventure];
        if (allowedModes.includes(event.toGameMode)) {
            playerData.get(event.player.id)?.updateManaUi();
        }
    }
}

// Game Initialization
Game.initialize();
