import { system, Direction } from "@minecraft/server";
export class GestureTracker {
    constructor(player, callback) {
        this.idleTicks = 0;
        this.direction = null;
        this.player = player;
        this.onGesture = callback;
        this.startRotation = this.getRotation();
    }
    static isTracking(player) {
        return this.activeTrackers.has(player.id);
    }
    static startTracking(player, callback) {
        const tracker = new GestureTracker(player, callback);
        this.activeTrackers.set(player.id, tracker);
        if (this.INTERVAL_ID === null) {
            this.INTERVAL_ID = system.runInterval(() => this.tickAll());
        }
    }
    static stopTracking(player) {
        this.activeTrackers.delete(player.id);
        if (this.activeTrackers.size === 0 && this.INTERVAL_ID !== null) {
            system.clearRun(this.INTERVAL_ID);
            this.INTERVAL_ID = null;
        }
    }
    static tickAll() {
        for (const tracker of this.activeTrackers.values()) {
            tracker.tick();
        }
    }
    getRotation() {
        const rot = this.player.getRotation();
        return { pitch: rot.x, yaw: rot.y };
    }
    tick() {
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
        let currentDirection = null;
        if (Math.abs(deltaYaw) > Math.abs(deltaPitch)) {
            currentDirection = deltaYaw > 0 ? 'yaw+' : 'yaw-';
        }
        else {
            currentDirection = deltaPitch > 0 ? 'pitch+' : 'pitch-';
        }
        if (!this.direction) {
            this.direction = currentDirection;
        }
        else if (this.direction !== currentDirection) {
            this.startRotation = this.getRotation();
            this.direction = null;
            return;
        }
        // Détection
        if ((this.direction === 'yaw+' || this.direction === 'yaw-') && Math.abs(deltaYaw) >= YAW_THRESHOLD) {
            this.feedback(deltaYaw > 0 ? Direction.East : Direction.West);
        }
        else if ((this.direction === 'pitch+' || this.direction === 'pitch-') && Math.abs(deltaPitch) >= PITCH_THRESHOLD) {
            this.feedback(deltaPitch > 0 ? Direction.Down : Direction.Up);
        }
    }
    feedback(direction) {
        this.onGesture(direction, this.player); // 💡 Appel du callback
        this.startRotation = this.getRotation();
        this.direction = null;
    }
}
GestureTracker.activeTrackers = new Map();
GestureTracker.INTERVAL_ID = null;
