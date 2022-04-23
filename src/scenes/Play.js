class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.image("pSprite", "./assets/player.png");
        this.load.image("ground", "./assets/ground.png");

        this.load.image("testObstacle1", "./assets/testObstacle1.png");
        this.load.image("testObstacle2", "./assets/testObstacle2.png");
        this.load.image("testObstacle3", "./assets/testObstacle3.png");
    }

    create() {

        //ground + player creation
        let ground = this.physics.add.sprite(game.config.width/2, game.config.height - borderPadding, "ground");
        ground.body.allowGravity = false;
        ground.setImmovable();
        player = new Player(this, game.config.width/2, game.config.height - borderPadding - borderUISize - ground.height, "pSprite");
        player.setGravityY(1200);
        this.playerVelocity = new Phaser.Math.Vector2(0,0);

        //makeing obstacles
        this.obs = this.physics.add.group();
        this.obj = [];
        this.generation();

        //add colliders
        this.physics.add.collider(player, ground);
        this.physics.add.collider(player, this.obs);

        //jump and pause keys
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        //pause event
        keyP.on('down', (event) => {
            if (this.pause) {
                this.pause = false;
                player.setGravityY(1200);
                player.body.velocity = this.playerVelocity;
                console.log(this.playerVelocity)
            } else {
                this.pause = true;
                for (this.i = 0; this.i < this.obj.length; this.i++) {
                    this.obj[this.i].setVelocityX(0);
                }
                this.playerVelocity = player.body.velocity.clone();
                player.setGravityY(0);
                player.setVelocityY(0);
            }
        });
        this.pause = false
    }

    update() {
        if (this.pause == false) {
            //create and move obs
            for (this.i = 0; this.i < this.obj.length; this.i++) {
                this.obj[this.i].setVelocityX(-150);
                if (this.obj[this.i].x <= 0) {
                    this.dest = this.obj.splice(0, 1);
                    for (this.j = 0; this.j < this.dest.length; this.j++) {
                        this.dest[this.j].destroy();
                    }
                }
            }
            //sprite update call
            player.update();
        }
    }

    generation() {
        this.clock = this.time.delayedCall(Phaser.Math.Between(1000, 1750), () => {
            if (!this.pause) {
                this.objNum = Phaser.Math.Between(0, 3);
                if (this.objNum == 0) {
                    this.obj.push(this.obs.create(640, 430, 'testObstacle1'));
                } else if (this.objNum == 1) {
                    this.obj.push(this.obs.create(640, 430, 'testObstacle2'));
                } else if (this.objNum == 2) {
                    this.obj.push(this.obs.create(640, 400, 'testObstacle3'));
                }
            }
            this.generation();
        }, null, this);
    }
}