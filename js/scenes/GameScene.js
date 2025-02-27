import Phaser from 'phaser';
import {Player} from "../classes/player/Player";
import {Chest} from "../classes/Chest";
import {MapClass} from "../classes/Map";
import {GameManager} from "../game_manager/GameManager";
import {Monster} from "../classes/Monster";
import {PlayerContainer} from "../classes/player/PlayerContainer";

export class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init () {
        // Add another scene over the current one
        this.scene.launch('UI');
    }

    create() {
        this.createAudio();
        this.createMap();
        this.createGroups();
        this.createInput();
        this.createGameManager();
    }

    createAudio() {
        this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 0.3 });
        this.enemyDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 0.2 });
        this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.3 });
        this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 0.2 });
        this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 0.2 });
    }

    createPlayer(playerObject) {
        this.player = new PlayerContainer(
            this,
            playerObject.x * 2,
            playerObject.y * 2,
            'characters',
            0,
            playerObject.health,
            playerObject.maxHealth,
            playerObject.id,
            this.playerAttackAudio
        );
    }

    createGroups() {
        this.chests = this.physics.add.group();
        this.monsters = this.physics.add.group();
        this.monsters.runChildUpdate = true;
    }

    spawnChest(chestObject) {
        let chest = this.chests.getFirstDead();

        if (!chest) {
            chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
            // add chest to chests group
            this.chests.add(chest);
        } else {
            chest.coins = chestObject.gold;
            chest.id = chestObject.id;
            chest.setPosition(chestObject.x * 2, chestObject.y * 2);
            chest.makeActive();
        }
    }

    spawnMonster(monsterObject) {
        let monster = this.monsters.getFirstDead();

        if (!monster) {
            monster = new Monster(
                this,
                monsterObject.x,
                monsterObject.y,
                'monsters',
                monsterObject.frame,
                monsterObject.id,
                monsterObject.health,
                monsterObject.maxHealth
            );
            // add monster to monsters group
            this.monsters.add(monster);
        } else {
            monster.id = monsterObject.id;
            monster.health = monsterObject.health;
            monster.maxHealth = monsterObject.maxHealth;
            monster.setTexture('monsters', monsterObject.frame);
            monster.setPosition(monsterObject.x, monsterObject.y);
            monster.makeActive();
        }
    }

    createInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    addCollisions() {
        this.physics.add.collider(this.player, this.map.blockedLayer);
        this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
        this.physics.add.collider(this.monsters, this.map.blockedLayer);
        this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    }

    enemyOverlap(weapon, enemy) {
        if (this.player.playerAttacking && !this.player.swordHit) {
            this.player.swordHit = true;
            this.events.emit('monsterAttacked', enemy.id, this.player.id);
        }
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(this.cursors);
        }
    }

    collectChest(player, chest) {
        // play gold pickup sound
        this.goldPickupAudio.play();
        this.events.emit('pickUpChest', chest.id, player.id);
    }

    createMap() {
        this.map = new MapClass(this, 'map', 'background', 'background', 'blocked');
    }

    createGameManager() {
        this.events.on('spawnPlayer', (playerObject) => {
            this.createPlayer(playerObject);
            this.addCollisions();
        });

        this.events.on('chestSpawned', (chest) => {
            this.spawnChest(chest);
        });

        this.events.on('monsterSpawned', (monster) => {
            this.spawnMonster(monster);
        });

        this.events.on('monsterRemoved', (monsterId) => {
            this.monsters.getChildren().forEach((monster) => {
                if (monster.id === monsterId) {
                    monster.makeInactive();
                    this.enemyDeathAudio.play();
                }
            });
        });

        this.events.on('chestRemoved', (chestId) => {
            this.chests.getChildren().forEach((chest) => {
                if (chest.id === chestId) {
                    chest.makeInactive();
                }
            });
        });

        this.events.on('updateMonsterHealth', (monsterId, health) => {
            this.monsters.getChildren().forEach((monster) => {
                if (monster.id === monsterId) {
                    monster.updateHealth(health);
                }
            });
        });

        this.events.on('monsterMovement', (monsters) => {
            this.monsters.getChildren().forEach((monster) => {
                Object.keys(monsters).forEach((monsterId) => {
                    if (monster.id === monsterId) {
                        this.physics.moveToObject(monster, monsters[monsterId], 40);
                    }
                });
            });
        });

        this.events.on('updatePlayerHealth', (playerId, health) => {
            this.player.updateHealth(health);
            if (health < this.player.health) {
                this.playerDamageAudio.play();
            }
        });

        this.events.on('respawnPlayer', (playerObject) => {
            this.player.respawn(playerObject);
            this.playerDeathAudio.play();
        });

        this.gameManager = new GameManager(this, this.map.map.objects);
        this.gameManager.setup();
    }
}
