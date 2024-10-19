import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
    }

    init() {
        // grab a reference to the Game Scene
        this.gameScene = this.scene.get('Game');
    }

    create() {
        this.setupUIElements();
        this.setupEvent();
    }

    setupUIElements() {
        // create the score text game object
        this.scoreText = this.add.text(
            35,
            8,
            'Coins: 0',
            {
                fontSize: '16px',
                fill: '#fff'
            })
        ;
        this.coinIcon = this.add.image(15, 15, 'items', 3);
    }

    setupEvent() {
        // listen for the updateScore event from the game scene
        this.gameScene.events.on('updateScore', (score) => {
            this.scoreText.setText(`Coins: ${score}`);
        });
    }
}