class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.atlas("pSprite", "./assets/player/player.png", "./assets/player/playerSprites.json");
        this.load.image("ground", "./assets/ground.png");
        this.load.atlas("monster", "./assets/monster/blob.png", "./assets/monster/blobSprite.json");

        this.load.image("rock", "./assets/obstacles/rock.png");
        this.load.image("log", "./assets/obstacles/log.png");
        this.load.image("stump", "./assets/obstacles/stump.png");
        this.load.atlas("bat", "./assets/obstacles/bat.png", "./assets/obstacles/fly.json");
        this.load.atlas("SpeedUp", "./assets/obstacles/coin.png", "./assets/obstacles/coinSprites.json");

        this.load.audio('Pause', './assets/audio/Pause.wav');
        this.load.audio('Jump', './assets/audio/Jump.wav');
        this.load.audio('Trip', './assets/audio/Trip.wav');
        this.load.audio('Slide', './assets/audio/Slide.wav');

        this.load.image("background001", "./assets/background/background001.png");
        this.load.image("background002", "./assets/background/background002.png");
        this.load.image("background003", "./assets/background/background003.png");
        this.load.image("background004", "./assets/background/background004.png");
        this.load.image("background005", "./assets/background/background005.png");
        this.load.image("background006", "./assets/background/background006.png");

        this.load.image("jump_int", "./assets/Instruct/JumpInt.png");
        this.load.image("slide_int", "./assets/Instruct/SlideInt.png");
        this.load.image("pause_int", "./assets/Instruct/PauseInt.png");
    }

    create() {
        this.physics.world.setFPS(60);

        this.cameras.main.fadeIn(1000);

        //init music
        music = this.sound.add('bgm', {volume: 0.5});
        music.setLoop(true);
        music.play();

        //init sound effects
        this.jumpSFX = this.sound.add('Jump');
        this.pauseSFX = this.sound.add('Pause');
        this.slideSFX = this.sound.add('Slide');
        this.tripSFX = this.sound.add('Trip');

        //background creation
        this.background1 = this.physics.add.sprite(0, 0, 'background001').setOrigin(0, 0);
        this.background2 = this.physics.add.sprite(0, 0, 'background002').setOrigin(0, 0);
        this.background3 = this.physics.add.sprite(0, 0, 'background003').setOrigin(0, 0);
        this.background4 = this.physics.add.sprite(0, 0, 'background004').setOrigin(0, 0);
        this.background5 = this.physics.add.sprite(0, 0, 'background005').setOrigin(0, 0);
        this.background6 = this.physics.add.sprite(0, 0, 'background006').setOrigin(0, 0);

        //ground + player creation
        let ground = this.physics.add.sprite(game.config.width/2, game.config.height - borderPadding * 10, "ground").setDepth(-1);
        ground.body.allowGravity = false;
        ground.setImmovable();
        this.top = game.config.height - borderPadding * 10 - ground.height;
        this.anims.create({key: "running", frames: this.anims.generateFrameNames('pSprite', {prefix: 'walk', end: 1, zeroPad:2}), frameRate: 5, repeat: -1});
        this.anims.create({key: "jump", frames: this.anims.generateFrameNames('pSprite', {prefix: 'jump', end: 0, zeroPad:1}), repeat: -1});
        this.anims.create({key: "slide", frames: this.anims.generateFrameNames('pSprite', {prefix: 'slide', end: 0, zeroPad:1}), repeat: -1});
        player = new Player(this, game.config.width/1.25, this.top - 200, "pSprite").setDepth(1);
        player.anims.play("running", true);
        player.setSize();
        player.setGravityY(player.gravityVal);
        player.setVelocityX(player.xSpeed);

        //Monster + bat creation
        this.anims.create({key: 'monsterMovement', frames: this.anims.generateFrameNames('monster', {prefix: 'blob', end: 19, zeroPad:3}), frameRate: 10, repeat: -1});
        monster = this.physics.add.sprite(70, 320, "monster").setDepth(1);
        this.anims.create({key: "flying", frames: this.anims.generateFrameNames('bat', {prefix: 'fly', end: 1, zeroPad:2}), frameRate: 4, repeat: -1});

        //makeing obstacles & power ups
        this.obs = this.physics.add.group();
        this.spd = this.physics.add.group();
        this.obj = [];
        this.powers = [];
        this.powerup = false;
        this.objXVelocity = -180;
        this.minTime = 1000;
        this.maxTime = 1700;
        this.t = 0;
        this.anims.create({key: 'spinCoin', frames: this.anims.generateFrameNames('SpeedUp', {prefix: 'coin', end: 5, zeroPad:3}), frameRate: 15, repeat:-1});
        this.generation();

        //add colliders
        this.physics.add.collider(player, ground);
        this.physics.add.overlap(player, this.obs, this.trip, null, this);
        this.physics.add.overlap(player, this.spd, this.run, null, this);
        this.physics.add.overlap(player, monster, this.gameover, null, this);

        //jump and pause keys
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        let s = false;
        let j = false;
        //play jump/slide sound
        keySPACE.on('down', (event) => {
            if (!s) {
                j = true;
                this.jumpSFX.play();
            }
        });
        keySPACE.on('up', (event) => {
            if (!s) {
                j = false;
                player.anims.play("running", true);
            }
        });
        keyS.on('down', (event) => {
            if (!j) {
                s = true;
                this.slideSFX.play();
                player.anims.play('slide', true);
            }
        });
        keyS.on('up', (event) => {
            if (!j) {
                s = false;
                player.anims.play("running", true);
                player.y -= 10;
            }
        });
        //pause event
        keyP.on('down', (event) => {
            if (this.pause) {
                this.pause = false;
                music.resume();
                //music.mute = false;
                this.pauseSFX.play();
                this.physics.enableUpdate();
            } else {
                this.pause = true;
                music.pause();
                //music.mute = true;
                this.pauseSFX.play();
                this.physics.disableUpdate();
            }
        });
        this.pause = false

        //making the clock
        this.ClockTime = 600;
        this.hours = (String(Math.floor(this.ClockTime/60)).padStart(2, "0"));
        this.minutes = (String(this.ClockTime % 60).padStart(2, "0"));
        this.ClockScore = this.add.text(500, 15, this.hours + ":" + this.minutes, {fontFamily: 'Digital'}).setFontSize(35);
        this.gameup = false;

        //making instuctions
        this.add.image(190, 10, "jump_int").setOrigin(0, 0).scale = 0.2;
        this.add.image(300, 10, "slide_int").setOrigin(0, 0).scale = 0.2;
        this.add.image(390, 10, "pause_int").setOrigin(0, 0).scale = 0.2;
    }

    update() {
        if (player.y > (monster.y + 10)) {
            player.y = monster.y - 20;
        }
        if (this.pause == false) {
            //move background
            this.background1.setVelocityX(this.objXVelocity * 0.2);
            this.background2.setVelocityX(this.objXVelocity * 0.4);
            this.background3.setVelocityX(this.objXVelocity * 0.6);
            this.background4.setVelocityX(this.objXVelocity * 0.8);
            this.background5.setVelocityX(this.objXVelocity);
            this.background6.setVelocityX(this.objXVelocity);
            if (this.background1.x <= -960) {
                this.background1.x = 0;
            }
            if (this.background2.x <= -960) {
                this.background2.x = 0;
            }
            if (this.background3.x <= -960) {
                this.background3.x = 0;
            }
            if (this.background4.x <= -960) {
                this.background4.x = 0;
            }
            if (this.background5.x <= -960) {
                this.background5.x = 0;
                this.background6.x = 0;
            }

            //independent clock update
            this.t += 0.5;
            if(this.t%60 == 0){
                this.ClockTime++;
            }

            //create and move obs
            for (this.i = 0; this.i < this.obj.length; this.i++) {
                this.obj[this.i].setSize(this.obj[this.i].width/3, this.obj[this.i].height/2)
                this.obj[this.i].setVelocityX(this.objXVelocity);
                if (this.obj[this.i].x <= 0) {
                    this.dest = this.obj.splice(0, 1);
                    for (this.j = 0; this.j < this.dest.length; this.j++) {
                        this.dest[this.j].destroy();
                    }
                }
            }
            for (this.i = 0; this.i < this.powers.length; this.i++) {
                this.powers[this.i].setVelocityX(this.objXVelocity)
                if (this.powers[this.i].x <= 0) {
                    this.dest = this.powers.splice(0, 1);
                    for (this.j = 0; this.j < this.dest.length; this.j++) {
                        this.dest[this.j].destroy();
                    }
                    this.powerup = false;
                } 
            }
            //sprite update call
            player.update();
            if (this.ClockTime >= 780) {
                this.ClockTime = 60;
            }
            this.hours = (String(Math.floor(this.ClockTime/60)).padStart(2, "0"));
            this.minutes = (String(this.ClockTime % 60).padStart(2, "0"));
            this.ClockScore.text = (this.hours + ":" + this.minutes);

            //monster animation
            monster.anims.play("monsterMovement", true);

            //speeds up the game
            if((this.minutes != 0 && this.minutes%15 == 0) && (!this.gameup)){
                this.gameup = true;
                if(this.minTime > 600){
                    this.objXVelocity -= 25;
                    this.minTime -= 100;
                    this.maxTime -= 300;
                    player.jumpForce -= 0.25;
                    player.gravityVal += 90;
                    player.setGravityY(player.gravityVal);
                }
                this.clock = this.time.delayedCall(500, () => {
                    this.gameup = false;
                });
            }
            timeH = this.hours;
            timeM = this.minutes;
        }
    }

    generation() {
        this.clock = this.time.delayedCall(Phaser.Math.Between(this.minTime, this.maxTime), () => {
            if (!this.pause) {
                let objNum = Phaser.Math.Between(0, 4);
                if (objNum == 0) {
                    this.obj.push(this.obs.create(670, this.top, 'rock').setScale(0.5));
                } else if (objNum == 1) {
                    this.obj.push(this.obs.create(670, this.top, 'log').setScale(0.5));
                } else if (objNum == 2) {
                    this.obj.push(this.obs.create(670, this.top, 'stump').setScale(0.5));
                } else if (objNum == 3) {
                    this.obj.push(this.obs.create(670, this.top - 50, 'bat').play('flying', true).setScale(0.5));
                }
                objNum = Phaser.Math.Between(0, 4);
                if (objNum == 0 && this.powerup == false) {
                    this.powers.push(this.spd.create(750, this.top, 'SpeedUp').play('spinCoin', true));
                    this.powerup = true;
                }
            }
            this.generation();
        }, null, this);
    }

    trip(){
        player.setVelocityX(-80);
        if (!this.tripSFX.isPlaying && !player.jumpDisabled) {
            this.tripSFX.play();
        }
        player.jumpDisabled = true;
        this.time.delayedCall(500, () => {
            player.jumpDisabled = false;
            player.setVelocityX(player.xSpeed);
        }, null, this);
    }

    run(){
        player.setVelocityX(120);
        this.powers.pop().destroy();
        this.powerup = false
        this.time.delayedCall(300, () => {
            player.setVelocityX(player.xSpeed);
        }, null, this);
    }

    gameover() {
        //go back to main menu
        music.mute = true;
        this.scene.start('gameOverScene');
    }
}