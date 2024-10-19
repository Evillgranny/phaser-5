import Phaser from 'phaser';
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { TitleScene } from "./scenes/TitleScene";
import { UIScene } from "./scenes/UIScene";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [BootScene, TitleScene, GameScene, UIScene],
    physics: {
      default: 'arcade',
        arcade: {
            gravity: {
                y: 0,
            },
            debug: true,
        },
    },
    pixelArt: true,
    roundPixels: true,
}

new Phaser.Game(config);