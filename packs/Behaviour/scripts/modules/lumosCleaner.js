import { system, world } from "@minecraft/server";
export function cleanupLumosEntities() {
    const dimensions = ["overworld", "nether", "the_end"];
    let entityAmount = 0;
    dimensions.forEach((dimensionId) => {
        const dimension = world.getDimension(dimensionId);
        const players = dimension.getPlayers();
        if (players.length > 1)
            return;
        const entities = dimension.getEntities({
            type: "witchcraft:lumos_entity"
        });
        entityAmount += entities.length;
        for (const e of entities) {
            const pos = e.location;
            const block = dimension.getBlock(pos);
            system.run(() => {
                if (block?.typeId === "minecraft:light_block_15") {
                    dimension.setBlockType(pos, "minecraft:air");
                }
                if (e.isValid) {
                    e.triggerEvent("minecraft:despawn_now");
                }
            });
        }
    });
    if (entityAmount > 0) {
        console.log(`[Witchcraft] Light entities successfully killed.`);
    }
    else {
        console.log(`[Witchcraft] No light entity found.`);
    }
}
