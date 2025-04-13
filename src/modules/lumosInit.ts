import { Player, system } from "@minecraft/server";

export function cleanupLumosEntities(players: Player[]) {
    for (const player of players) {
        const lumosEntities = player.dimension.getEntities({
            tags: [`lumos:${player.id}`],
            type: "witchcraft:lumos_entity"
        });

        for (const entity of lumosEntities) {
            const pos = entity.location;
            const block = player.dimension.getBlock(pos);

            system.run(() => {
                if (block?.typeId === "minecraft:light_block_15") {
                    player.dimension.setBlockType(pos, "minecraft:air");
                }

                try {
                    if (entity.isValid) {
                        entity.kill();
                    }
                } catch (e) {
                    console.error(`[Witchcraft] Couldn't kill entity: ${e}`);
                }
            });
        }

        if (lumosEntities.length > 0) {
            console.log(`[Witchcraft] Light entities successfully killed.`);
        }
        else {
            console.log(`[Witchcraft] No light entity found.`);
        }
    }
}
