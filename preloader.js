
BasicGame.Preloader = function (game) {

  this.background = null;
  this.preloadBar = null;

  //this.ready = false;

};

BasicGame.Preloader.prototype = {

  preload: function () {
    this.stage.backgroundColor = '#2d2d2d';

    this.preloadBar = this.add.sprite(this.game.width / 2 - 100, this.game.height / 2, 'preloaderBar');
    this.add.text(this.game.width / 2, this.game.height / 2 - 30, "Loading...", { font: "32px monospace", fill: "#fff" }).anchor.setTo(0.5, 0.5);

    this.load.setPreloadSprite(this.preloadBar);

    // load the rest of the visual assets 
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemyBullet', 'assets/enemy-bullet.png');
    this.load.image('powerup1', 'assets/gunPowerUp.png');
    this.load.spritesheet('smallTarget', 'assets/SmallTarget.png', 55, 60);
    this.load.spritesheet('smallShooter', 'assets/SmallShooter.png', 55, 60);
    this.load.spritesheet('bossEnemy', 'assets/EnemyLargeBig.png', 406, 199);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/FrogfootSpriteSheet.png', 50, 64);
  },

  create: function () {

    this.preloadBar.cropEnabled = false;

  },

  update: function () {

    
    //if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
    //{
    //  this.ready = true;
      this.state.start('MainMenu');
    //}

  }

};
