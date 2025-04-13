import {Player} from "@minecraft/server";

const manaMap = new Map<string, number>();

export function getMana(player: Player): number {
    return manaMap.get(player.id) ?? 100;
}

export function setMana(player: Player, value: number) {
    manaMap.set(player.id, Math.max(0, value));
}

export function decreaseMana(player: Player, amount: number): boolean {
    const current = getMana(player);
    if (current < amount) return false;
    setMana(player, current - amount);
    return true;
}