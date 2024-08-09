class Scene1 extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }

    preload() {

        this.load.image('touchOrigin', 'assets/images/touchpad.png'); // load touchpad assets
        this.load.image('touchCurrent', 'assets/images/touchpad.png');
        this.load.image('fireButton', 'assets/images/touchpad.png');

        this.load.image("background", "assets/images/BackgroundStars.png");
        this.load.spritesheet("ship1", "assets/spritesheets/ship1.png", {
            frameWidth: 16, 
            frameHeight: 16
        });
        this.load.spritesheet("ship2", "assets/spritesheets/ship2.png", {
            frameWidth: 32, 
            frameHeight: 16
        });
        this.load.spritesheet("ship3", "assets/spritesheets/ship3.png", {
            frameWidth: 32, 
            frameHeight: 32
        });
        this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("power-up", "assets/spritesheets/power-up.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("ship4", "assets/images/ShipFullHealth.png");

        this.load.spritesheet("player", "assets/spritesheets/player.png", {
            frameWidth: 16,
            frameHeight: 24
        });
        this.load.spritesheet("beam", "assets/spritesheets/beam.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.bitmapFont("pixelFont", "assets/font/font.png", "assets/font/font.xml");
    }

    create() {
        this.scene.start("playGame");
    }
}
