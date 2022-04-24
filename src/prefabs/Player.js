class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
      super(scene, x, y, texture);

      scene.physics.add.existing(this);
      scene.add.existing(this);

      this.jump = false;
      this.exponential = 2
      this.xSpeed = -3;
    }


    update() {

      if(keySPACE.isDown && !this.jump){
        this.jump = true;
        this.setVelocityY(-500);
      }
      if(this.body.touching.down){
        this.jump = false;
    }
    }

    reset() {
      
    }
}