var BasicGame = {
  SEA_SCROLL_SPEED: 12,
  ENEMY_MIN_Y_VELOCITY: 30,
  ENEMY_MAX_Y_VELOCITY: 60,
  SHOOTER_MIN_VELOCITY: 30,
  SHOOTER_MAX_VELOCITY: 80,
  BOSS_Y_VELOCITY: 22,
  BOSS_X_VELOCITY: 200,
  BULLET_VELOCITY: 500,
  ENEMY_BULLET_VELOCITY: 150,
  POWERUP_VELOCITY: 100,

  SPAWN_ENEMY_DELAY: Phaser.Timer.SECOND,
  SPAWN_SHOOTER_DELAY: Phaser.Timer.SECOND * 3,

  SHOT_DELAY: Phaser.Timer.SECOND * 0.1,
  SHOOTER_SHOT_DELAY: Phaser.Timer.SECOND * 2,
  BOSS_SHOT_DELAY1: Phaser.Timer.SECOND,
  BOSS_SHOT_DELAY2: Phaser.Time.SECOND * 1.8,
  BOSS_SHOT_DELAY3: Phaser.Time.SECOND * 1.6,

  ENEMY_HEALTH: 2,
  SHOOTER_HEALTH: 2,
  BOSS_HEALTH: 500,

  BULLET_DAMAGE: 1,
  CRASH_DAMAGE: 5,

  ENEMY_REWARD: 100,
  SHOOTER_REWARD: 200,
  BOSS_REWARD: 10000,
  POWERUP_REWARD: 100,
  POWERUP_REWARD_MAX: 500,
  BOSS_SPAWN_SCORE: 5000,
  DEBUG_SPAWN_SCORE: 0,

  ENEMY_DROP_RATE: 0.3,
  SHOOTER_DROP_RATE: 0.5,
  BOSS_DROP_RATE: 0,

  PLAYER_EXTRA_LIVES: 3,
  PLAYER_GHOST_TIME: Phaser.Timer.SECOND * 3,

  INSTRUCTION_EXPIRE: Phaser.Timer.SECOND * 10,
  RETURN_MESSAGE_DELAY: Phaser.Timer.SECOND * 2,
  
  FROGFOOT_BULLET_DISTANCE: 30,
  FROGFOOT_BULLET_VELOCITY: 500,
  FROGFOOT_SPEED: 300,
  
};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

  init: function () {

    this.input.maxPointers = 1;

    // this.stage.disableVisibilityChange = true;

    if (this.game.device.desktop) {

    } else {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.setMinMax(480, 260, 1024, 768);
      this.scale.forceLandscape = true;
    }
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
  },

  preload: function () {

    this.load.image('preloaderBar', 'assets/preloader-bar.png');

  },

  create: function () {

    this.state.start('Preloader');

  }

};
