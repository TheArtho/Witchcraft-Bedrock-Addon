import {Player} from "@minecraft/server";
import {Spell, SpellIds} from "./Spell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

export class FailSpell extends Spell {
    constructor(caster: Player) {
        super(SpellIds.Fail, "Failed", "Tu as raté ton sort...", MinecraftTextColor.White, caster);
    }

    cast(): void {
        this.caster.sendMessage("Whoops...");
    }

    getManaCost(): number {
        return 0;
    }
}