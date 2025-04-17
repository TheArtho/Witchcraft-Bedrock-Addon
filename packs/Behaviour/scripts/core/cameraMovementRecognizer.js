import { system, world } from "@minecraft/server";
const activeGestures = new Map();
// Seuils personnalisés
const YAW_THRESHOLD = 20; // Pour gauche / droite
const PITCH_THRESHOLD = 10; // Pour haut / bas (plus petit car plage plus courte)
const IDLE_RESET_TICKS = 6;
const IDLE_THRESHOLD = 1;
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const { x: pitch, y: yaw } = player.getRotation();
        const name = player.name;
        let gesture = activeGestures.get(name);
        if (!gesture) {
            gesture = {
                startRotation: { pitch, yaw },
                idleTicks: 0,
                direction: null
            };
            activeGestures.set(name, gesture);
            continue;
        }
        const deltaYaw = yaw - gesture.startRotation.yaw;
        const deltaPitch = pitch - gesture.startRotation.pitch;
        const movement = Math.abs(deltaYaw) + Math.abs(deltaPitch);
        // Inactivité
        if (movement < IDLE_THRESHOLD) {
            gesture.idleTicks++;
            if (gesture.idleTicks >= IDLE_RESET_TICKS) {
                gesture.startRotation = { pitch, yaw };
                gesture.idleTicks = 0;
                gesture.direction = null;
            }
            continue;
        }
        gesture.idleTicks = 0;
        // Détermination de la direction principale
        let currentDirection = null;
        if (Math.abs(deltaYaw) > Math.abs(deltaPitch)) {
            currentDirection = deltaYaw > 0 ? 'yaw+' : 'yaw-';
        }
        else {
            currentDirection = deltaPitch > 0 ? 'pitch+' : 'pitch-';
        }
        if (!gesture.direction) {
            gesture.direction = currentDirection;
        }
        else if (gesture.direction !== currentDirection) {
            gesture.startRotation = { pitch, yaw };
            gesture.direction = null;
            return;
        }
        // Détection de mouvement avec seuils séparés
        if ((gesture.direction === 'yaw+' || gesture.direction === 'yaw-') &&
            Math.abs(deltaYaw) >= YAW_THRESHOLD) {
            player.sendMessage(deltaYaw > 0 ? "→ Droite" : "← Gauche");
            player.playSound("random.orb", { volume: 0.5 });
            gesture.startRotation = { pitch, yaw };
            gesture.direction = null;
        }
        else if ((gesture.direction === 'pitch+' || gesture.direction === 'pitch-') &&
            Math.abs(deltaPitch) >= PITCH_THRESHOLD) {
            player.sendMessage(deltaPitch > 0 ? "↓ Bas" : "↑ Haut");
            player.playSound("random.orb", { volume: 0.5 });
            gesture.startRotation = { pitch, yaw };
            gesture.direction = null;
        }
    }
});
