import {world, system, Player, Direction} from "@minecraft/server";

type Rotation = { pitch: number, yaw: number };

export class GestureTracker {
    private static activeTrackers = new Map<string, GestureTracker>();
    private static INTERVAL_ID: number | null = null;

    private readonly player: Player;
    private readonly onGesture: (dir: Direction, player: Player) => void;

    private startRotation: Rotation;
    private idleTicks: number = 0;
    private direction: 'yaw+' | 'yaw-' | 'pitch+' | 'pitch-' | null = null;

    constructor(player: Player, callback: (dir: Direction, player: Player) => void) {
        this.player = player;
        this.onGesture = callback;
        this.startRotation = this.getRotation();
    }

    static isTracking(player: Player): boolean {
        return this.activeTrackers.has(player.id);
    }

    static startTracking(player: Player, callback: (dir: Direction, player: Player) => void) {
        const tracker = new GestureTracker(player, callback);
        this.activeTrackers.set(player.id, tracker);
        if (this.INTERVAL_ID === null) {
            this.INTERVAL_ID = system.runInterval(() => this.tickAll());
        }
    }

    static stopTracking(player: Player) {
        this.activeTrackers.delete(player.id);
        if (this.activeTrackers.size === 0 && this.INTERVAL_ID !== null) {
            system.clearRun(this.INTERVAL_ID);
            this.INTERVAL_ID = null;
        }
    }

    private static tickAll() {
        for (const tracker of this.activeTrackers.values()) {
            tracker.tick();
        }
    }

    private getRotation(): Rotation {
        const rot = this.player.getRotation();
        return { pitch: rot.x, yaw: rot.y };
    }

    private tick() {
        const { pitch, yaw } = this.getRotation();

        const deltaYaw = yaw - this.startRotation.yaw;
        const deltaPitch = pitch - this.startRotation.pitch;
        const movement = Math.abs(deltaYaw) + Math.abs(deltaPitch);

        const IDLE_THRESHOLD = 1;
        const IDLE_RESET_TICKS = 6;
        const YAW_THRESHOLD = 20;
        const PITCH_THRESHOLD = 10;

        if (movement < IDLE_THRESHOLD) {
            this.idleTicks++;
            if (this.idleTicks >= IDLE_RESET_TICKS) {
                this.startRotation = this.getRotation();
                this.idleTicks = 0;
                this.direction = null;
            }
            return;
        }

        this.idleTicks = 0;

        let currentDirection: typeof this.direction = null;
        if (Math.abs(deltaYaw) > Math.abs(deltaPitch)) {
            currentDirection = deltaYaw > 0 ? 'yaw+' : 'yaw-';
        } else {
            currentDirection = deltaPitch > 0 ? 'pitch+' : 'pitch-';
        }

        if (!this.direction) {
            this.direction = currentDirection;
        } else if (this.direction !== currentDirection) {
            this.startRotation = this.getRotation();
            this.direction = null;
            return;
        }

        // Détection
        if ((this.direction === 'yaw+' || this.direction === 'yaw-') && Math.abs(deltaYaw) >= YAW_THRESHOLD) {
            this.feedback(deltaYaw > 0 ? Direction.East : Direction.West);
        } else if ((this.direction === 'pitch+' || this.direction === 'pitch-') && Math.abs(deltaPitch) >= PITCH_THRESHOLD) {
            this.feedback(deltaPitch > 0 ? Direction.Down : Direction.Up);
        }
    }

    private feedback(direction: Direction) {
        this.onGesture(direction, this.player); // 💡 Appel du callback
        this.startRotation = this.getRotation();
        this.direction = null;
    }
}
