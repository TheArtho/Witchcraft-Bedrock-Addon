const manaMap = new Map();
export function getMana(player) {
    return manaMap.get(player.id) ?? 100;
}
export function setMana(player, value) {
    manaMap.set(player.id, Math.max(0, value));
}
export function decreaseMana(player, amount) {
    const current = getMana(player);
    if (current < amount)
        return false;
    setMana(player, current - amount);
    return true;
}
