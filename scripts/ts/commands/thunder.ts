import {Player, system, world} from "@minecraft/server";

export default async function (player : Player) {
  const origin = player.getHeadLocation();
  const direction = player.getViewDirection();

  const maxDistance = 50;
  const step = 1;

  let hitLocation = null;

  // Raycast simplifié : avance le long de la direction
  for (let i = 1; i <= maxDistance; i += step) {
    const pos = {
      x: origin.x + direction.x * i,
      y: origin.y + direction.y * i,
      z: origin.z + direction.z * i,
    };

    const block = world.getDimension("overworld").getBlock(pos);

    if (block && block.typeId !== "minecraft:air") {
      hitLocation = block.location;
      break;
    }
  }

  if (!hitLocation) {
    player.sendMessage("§7Aucune cible trouvée dans ta ligne de mire.");
    return;
  }

  const posString = `${hitLocation.x} ${hitLocation.y + 1} ${hitLocation.z}`;

  system.run(() => player.runCommand(`summon lightning_bolt ${posString}`));
  player.sendMessage("⚡ BOUM !");
}
