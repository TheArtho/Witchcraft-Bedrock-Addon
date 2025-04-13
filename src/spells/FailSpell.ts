import {Player} from "@minecraft/server";
import {Spell, SpellIds} from "./Spell";
import {MinecraftTextColor} from "../utils/MinecraftTextColor";

export class FailSpell extends Spell {

    constructor() {
        super(SpellIds.Fail, "Failed", "Tu as raté ton sort...", MinecraftTextColor.White);
    }

    cast(caster: Player): void {
        caster.sendMessage("Whoops...");
    }
}