import Phaser from 'phaser';
import {Player} from "./Player";

const Direction = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN'
}

export class PlayerContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, key, frame, health, maxHealth, id, attackAudio) {
        super(scene, x, y);
        this.scene = scene; // the scene this game object will be added to
        this.velocity = 160; // velocity of player
        this.currentDirection = Direction.RIGHT;
        this.playerAttacking = false;
        this.flipX = true;
        this.swordHit = false;
        this.health = health;
        this.maxHealth = maxHealth;
        this.id = id;
        this.attackAudio = attackAudio;

        // set a size on the container
        this.setSize(64, 64)

        // enable physics
        this.scene.physics.world.enable(this);

        // collide with world bounds
        this.body.setCollideWorldBounds(true);

        // add the player to our existing scene
        this.scene.add.existing(this);

        // have the camera follow the player
        this.scene.cameras.main.startFollow(this);

        // create the player
        this.player = new Player(this.scene, 0, 0, key, frame);
        this.add(this.player);

        // create the weapon game object
        this.weapon = this.scene.add.image(40, 0, 'items', 4);
        this.scene.add.existing(this.weapon);
        this.weapon.setScale(1.5);
        this.scene.physics.world.enable(this.weapon);
        this.add(this.weapon);
        this.weapon.alpha = 0;

        // create health bar
        this.createHealthBar();
    }

    update(cursors) {
        this.body.setVelocity(0);

        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.velocity);
            this.currentDirection = Direction.LEFT;
            this.weapon.setPosition(-40, 0);
            this.player.flipX = false;
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(this.velocity);
            this.currentDirection = Direction.RIGHT;
            this.weapon.setPosition(40, 0);
            this.player.flipX = true;
        }

        if (cursors.up.isDown) {
            this.body.setVelocityY(-this.velocity);
            this.currentDirection = Direction.UP;
            this.weapon.setPosition(0, -40);
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(this.velocity);
            this.currentDirection = Direction.DOWN;
            this.weapon.setPosition(0, 40);
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.space) && !this.playerAttacking) {
            this.weapon.alpha = 1;
            this.playerAttacking = true;
            this.attackAudio.play();
            this.scene.time.delayedCall(150, () => {
                this.weapon.alpha = 0;
                this.playerAttacking = false;
                this.swordHit = false;
            }, [], this);
        }

        if (this.playerAttacking) {
            if (this.weapon.flipX) {
                this.weapon.angle -= 10;
            } else {
                this.weapon.angle += 10;
            }
        } else {
            if (this.currentDirection === Direction.DOWN) {
                this.weapon.setAngle(-270);
            } else if (this.currentDirection === Direction.UP) {
                this.weapon.setAngle(-90);
            } else {
                this.weapon.setAngle(0);
            }

            this.weapon.flipX = false;

            if (this.currentDirection === Direction.LEFT) {
                this.weapon.flipX = true;
            }
        }

        this.updateHealthBar();
    }

    respawn(playerObject) {
        this.health = playerObject.health;
        this.setPosition(playerObject.x * 2, playerObject.y * 2);
        this.updateHealthBar();
    }

    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xffffff, 1);
        this.healthBar.fillRect(this.x - 32, this.y - 40, 64, 5);
        this.healthBar.fillGradientStyle(0xff0000, 0xffffff, 0xff0000, 0xffffff, 1, 1, 1, 1);
        this.healthBar.fillRect(this.x - 32, this.y - 40, 64 * (this.health / this.maxHealth), 5);
    }

    updateHealth(health) {
        this.health = health;
        this.updateHealthBar();
    }
}