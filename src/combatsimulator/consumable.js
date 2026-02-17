import Buff from "./buff";
import { itemDetailMap } from "../lib/dataLoader";
import Trigger from "./trigger";

class Consumable {
    constructor(hrid, triggers = null) {
        this.hrid = hrid;

        let gameConsumable = itemDetailMap()[this.hrid];
        if (!gameConsumable) {
            throw new Error("No consumable found for hrid: " + this.hrid);
        }

        this.cooldownDuration = gameConsumable.consumableDetail.cooldownDuration;
        this.hitpointRestore = gameConsumable.consumableDetail.hitpointRestore;
        this.manapointRestore = gameConsumable.consumableDetail.manapointRestore;
        this.recoveryDuration = gameConsumable.consumableDetail.recoveryDuration;
        this.categoryHrid = gameConsumable.categoryHrid;

        this.buffs = [];
        if (gameConsumable.consumableDetail.buffs) {
            for (const consumableBuff of gameConsumable.consumableDetail.buffs) {
                let buff = new Buff(consumableBuff);
                this.buffs.push(buff);
            }
        }

        if (triggers && triggers.length > 0) {
            this.triggers = triggers;
        } else if (gameConsumable.consumableDetail.defaultCombatTriggers) {
            this.triggers = [];
            for (const defaultTrigger of gameConsumable.consumableDetail.defaultCombatTriggers) {
                let trigger = new Trigger(
                    defaultTrigger.dependencyHrid,
                    defaultTrigger.conditionHrid,
                    defaultTrigger.comparatorHrid,
                    defaultTrigger.value,
                );
                this.triggers.push(trigger);
            }
        } else {
            this.triggers = [];
        }

        this.lastUsed = Number.MIN_SAFE_INTEGER;
    }

    static createFromDTO(dto) {
        let triggers =
            dto.triggers && dto.triggers.length > 0
                ? dto.triggers.map((trigger) => Trigger.createFromDTO(trigger))
                : null;
        let consumable = new Consumable(dto.hrid, triggers);

        return consumable;
    }

    shouldTrigger(currentTime, source, target, friendlies, enemies) {
        if (source.isStunned) {
            return false;
        }
        let consumableHaste;
        if (this.categoryHrid.includes("food")) {
            consumableHaste = source.combatDetails.combatStats.foodHaste;
        } else {
            consumableHaste = source.combatDetails.combatStats.drinkConcentration;
        }
        let cooldownDuration = this.cooldownDuration;
        if (consumableHaste > 0) {
            cooldownDuration = cooldownDuration / (1 + consumableHaste);
        }

        if (this.lastUsed + cooldownDuration > currentTime) {
            return false;
        }

        if (this.triggers.length == 0) {
            return true;
        }

        let shouldTrigger = true;
        for (const trigger of this.triggers) {
            let isActive;
            try {
                isActive = trigger.isActive(source, target, friendlies, enemies, currentTime);
            } catch (e) {
                isActive = false;
            }
            if (!isActive) {
                shouldTrigger = false;
            }
        }

        return shouldTrigger;
    }
}

export default Consumable;
