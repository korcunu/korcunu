/// <reference path="types/phaser.d.ts" />

class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        this.score = 0;
        this.threshold = 100;
        
        this.origin = this.add.image(0, 0, 'touchOrigin'); // create touchpad assets
        this.current = this.add.image(0, 0, 'touchCurrent');
        this.origin.setScale(5);
        this.current.setScale(5);
        this.origin.alpha = 0; 
        this.current.alpha = 0;

        var graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(config.width, 0);
        graphics.lineTo(config.width, 20);
        graphics.lineTo(0, 20);
        graphics.lineTo(0, 0);
        graphics.closePath();
        graphics.fillPath();

        this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE " + this.zeroPad(this.score, 3), 16);

        // DEBUG SHOWING TOUCH CONTROLS
        this.angleLabel = this.add.bitmapText(10, 25, "pixelFont", "ANGLE " + this.zeroPad(0, 3), 16);
        this.forceLabel = this.add.bitmapText(10, 45, "pixelFont", "FORCE " + this.zeroPad(0, 3), 16);
        this.distanceLabel = this.add.bitmapText(10, 65, "pixelFont", "DISTANCE " + this.zeroPad(0, 3), 16);

        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        this.ship1 = this.add.sprite(config.width/2 - 50, config.height/2, "ship1");
        this.ship2 = this.add.sprite(config.width/2, config.height/2, "ship2");
        this.ship3 = this.add.sprite(config.width/2 + 50, config.height/2, "ship3");
        // this.ship4 = this.add.image(config.width/2 - 100, config.height/2, "ship4");
        // this.ship4.flipY = true;

        // add ships to enemies group
        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);    
        // Ships animations
        this.anims.create({
            key: "ship1_anim",
            frames: this.anims.generateFrameNumbers("ship1"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "ship2_anim",
            frames: this.anims.generateFrameNumbers("ship2"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "ship3_anim",
            frames: this.anims.generateFrameNumbers("ship3"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
        // Power Ups animations
        this.anims.create({
            key: "red",
            frames: this.anims.generateFrameNumbers("power-up", {
                start: 0,
                end: 1
            }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: "gray",
            frames: this.anims.generateFrameNumbers("power-up", {
                start: 2,
                end: 3
            }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: "thrust",
            frames: this.anims.generateFrameNumbers("player"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "beam_anim",
            frames: this.anims.generateFrameNumbers("beam"),
            frameRate: 20,
            repeat: -1
        });
        
        // Add power ups in a physics group
        this.powerUps = this.physics.add.group();

        var maxObjects = 4;
        for (var i = 0; i <= maxObjects; i++) {
            var powerUp = this.physics.add.sprite(16, 16, "power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, config.width, config.height);
            
            // randomly pick one of two animations
            if (Math.random() > 0.5) {
                powerUp.play("red");
            } else {
                powerUp.play("gray");
            }

            powerUp.setVelocity(80, 80);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1.005);

        }

        // Play animations for ships
        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);

        this.player = this.physics.add.sprite(config.width / 2 - 8, config.height - 64, "player");
        this.player.play("thrust");
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.projectiles = this.add.group();

        this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp) {
            projectile.destroy();
        });
        this.w_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.a_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.d_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);

    }

    zeroPad(number, size){
        var stringNumber = String(number);
        while(stringNumber.length < (size || 2)){
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

    hitEnemy(projectile, enemy){
        projectile.destroy();
        enemy.play("explode");
        this.score += 1;
        var scoreFormated = this.zeroPad(this.score, 3);
        this.scoreLabel.text = "SCORE " + scoreFormated;

        enemy.on('animationcomplete', function (animation, frame) {
            if (animation.key === 'explode') {
                this.resetShipPos(enemy);
                this.restoreEnemySprites();
            }
        }, this);
    }

    restoreEnemySprites(){
        this.ship1.setTexture("ship1");
        this.ship1.visible = true;
        this.ship2.setTexture("ship2");
        this.ship2.visible = true;
        this.ship3.setTexture("ship3");
        this.ship3.visible = true;
    }

    hitPlayer(player, enemy){
        this.resetShipPos(enemy);
        player.play('explode');
        if (this.score > 0){
            this.score -= 1;
        }
        var scoreFormated = this.zeroPad(this.score, 3);
        this.scoreLabel.text = "SCORE " + scoreFormated;
        
        player.on('animationcomplete', function (animation, frame) {
            if (animation.key === 'explode') {
                // Resetting player's position
                player.x = config.width / 2 - 8;
                player.y = config.height - 64;
                player.visible = true;
                player.setTexture('player'); // Switch back to the 'player' texture
                this.player.play("thrust");
                
            }
        }, this);
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
    }

    movePlayerManager() {
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        if (this.cursorKeys.left.isDown || this.a_key.isDown) {
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if (this.cursorKeys.right.isDown || this.d_key.isDown) {
            this.player.setVelocityX(gameSettings.playerSpeed);
        }

        if (this.cursorKeys.up.isDown || this.w_key.isDown) {
            this.player.setVelocityY(-gameSettings.playerSpeed);
        } else if (this.cursorKeys.down.isDown || this.s_key.isDown) {
            this.player.setVelocityY(gameSettings.playerSpeed);
        }

        if (this.input.pointer1.active) {
            var touch_y = this.distance * Math.sin(this.input.pointer1.getAngle()) * 5;
            var touch_x = this.distance * Math.cos(this.input.pointer1.getAngle()) * 5;

            if (touch_x > 200) {touch_x = 200;}
            if (touch_y > 200) {touch_y = 200;}
            
            this.player.setVelocityX(touch_x);
            this.player.setVelocityY(touch_y);
        }
    }

    moveShip(ship, speed) {
        ship.y += speed;

        if (ship.y > config.height) {
            this.resetShipPos(ship);
        }
    }

    resetShipPos(ship) {
        ship.y = 0;
        var randomX = Phaser.Math.Between(0, config.width);
        ship.x = randomX;
    }

    destroyShip(pointer, gameObject) {
        gameObject.setTexture("explosion");
        gameObject.play("explode");
    }

    shootBeam() {
        var beam = new Beam(this);
    }

    update() {
        this.moveShip(this.ship1, 3.2);
        this.moveShip(this.ship2, 2);
        this.moveShip(this.ship3, 2.8);
        // this.moveShip(this.ship4, 1.5)

        this.background.tilePositionY += -.5;

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.shootBeam();
        }
        
        if (this.input.pointer1.active) { // handle analog control
            this.origin.alpha = .25; // increase opacity
            this.current.alpha = .25;
            this.origin.setPosition(this.input.pointer1.downX, this.input.pointer1.downY); // assign coordinates
            this.current.setPosition(this.input.pointer1.x, this.input.pointer1.y); 
            this.angle = Math.trunc(this.input.pointer1.getAngle() * 180/Math.PI); // get data
            this.distance = Math.trunc(this.input.pointer1.getDistance());
            this.distance = Phaser.Math.Clamp(this.distance, 0, this.threshold);
            this.force = Math.trunc(this.distance / this.threshold*100);
    
              if (this.distance == this.threshold) { // limit distance of current visually
                Phaser.Math.RotateAroundDistance(this.current, this.origin.x, this.origin.y, 0, this.threshold);
              }// end if (this.distance
    
          }// end if (this.leftPointer.active...
    
          if (!this.input.pointer1.active) { // handle analog control end
            this.origin.setPosition(0, 0); // assign coordinates
            this.current.setPosition(0, 0); 
            this.origin.alpha = 0; // reduce opacity
            this.current.alpha = 0;
            this.angle = 0; // get data
            this.distance = 0;
            this.force = 0;
          }// end if (!this.movePointer.active...

        this.movePlayerManager();

        var angleFormatted = this.zeroPad(this.angle, 3);
        this.angleLabel.text = "ANGLE " + angleFormatted;

        var forceFormatted = this.zeroPad(this.force, 3);
        this.forceLabel.text = "FORCE " + forceFormatted;

        var distanceFormatted = this.zeroPad(this.distance, 3);
        this.distanceLabel.text = "DISTANCE " + distanceFormatted;
        
        for(var i = 0; i < this.projectiles.getChildren().length; i++){
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }
    }
}
