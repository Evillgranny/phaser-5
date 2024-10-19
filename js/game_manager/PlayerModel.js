import Phaser from "phaser";
import { v4 } from 'uuid';

export class PlayerModel {
    constructor(spawnLocations) {
        this.health = 10;
        this.maxHealth = 10;
        this.gold = 0;
        this.id = `player-${v4()}`;
        this.spawnLocations = spawnLocations;

        [this.x, this.y] = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    }

    updateGold(gold) {
        this.gold += gold;
    }

    updateHealth(health) {
        this.health += health;
        if (this.health > 10) {
            this.health = 10;
        }
    }

    respawn() {
        this.health = this.maxHealth;
        [this.x, this.y] = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    }
}