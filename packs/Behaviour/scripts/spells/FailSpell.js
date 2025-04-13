import { Spell, SpellIds } from "./Spell";
import { MinecraftTextColor } from "../utils/MinecraftTextColor";
export class FailSpell extends Spell {
    constructor(caster) {
        super(SpellIds.Fail, "Failed", "Tu as raté ton sort...", MinecraftTextColor.White, caster);
    }
    cast() {
        this.caster.sendMessage("Whoops...");
    }
}
