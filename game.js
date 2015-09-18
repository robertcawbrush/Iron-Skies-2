
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('smallEnemy', 'assets/enemy.png', 42, 42);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
  },
  
  
  create: function () {
    
    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
 
    //input inits
      //arrow keys
      this.cursors = this.input.keyboard.createCursorKeys();
      
      //everything else
      this.keyboard = this.input.keyboard;
  },

  update: function () {
    
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
  },
  
  render: function() {
    this.game.debug.body(this.player);
  },
  
  setupBackground: function () {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  },
  
  setupPlayer: function () {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20,20,0,-5);
  },
  
  setupEnemies: function() {
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(30, 'smallEnemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    
    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly', [0,1,2], 20, true);
      enemy.animations.add('hit', [3,1,3,2], 20,true);
      enemy.events.onAnimationComplete.add( function(e){
        e.play('fly');
      }, this);
    });
    
    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;
  },
  
  setupBullets: function() {
    
    //LeftGun
      //spritegroup
      this.bulletPool1 = this.add.group();
      
      //enable bullet physics
      this.bulletPool1.enableBody = true;
      this.bulletPool1.physicsBodyType = Phaser.Physics.ARCADE;
      
      //create 'magazine'
      this.bulletPool1.createMultiple(100, 'bullet');
      
      this.bulletPool1.setAll('anchor.x', 0.5);
      this.bulletPool1.setAll('anchor.y', 0.5);
      
      //destroys bullets if out of world view
      this.bulletPool1.setAll('outOfBoundsKill', true);
      this.bulletPool1.setAll('checkWorldBounds', true);
    
    //RightGun
      //spritegroup
      this.bulletPool2 = this.add.group();
      
      //enable bullet physics
      this.bulletPool2.enableBody = true;
      this.bulletPool2.physicsBodyType = Phaser.Physics.ARCADE;
      
      //create 'magazine'
      this.bulletPool2.createMultiple(100, 'bullet');
      
      this.bulletPool2.setAll('anchor.x', 0.5);
      this.bulletPool2.setAll('anchor.y', 0.5);
      
      //destroys bullets if out of world view
      this.bulletPool2.setAll('outOfBoundsKill', true);
      this.bulletPool2.setAll('checkWorldBounds', true);
    
    //establish firing rate
    this.nextShotAt = 0;
    this.shotDelay = 130;
  },
  
  setupExplosions: function () {
    
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100,'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    
    this.explosionPool.forEach(function (explosion){
      explosion.animations.add('boom');
    });
  },

  quitGame: function (pointer) {

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  },

  enemyHit: function(bullet, enemy) {
    bullet.kill();
    
    this.damageEnemy(enemy, basicGame.BULLET_DAMAGE);
  
  },
  
  fire: function() {
    //delay shot so firing rate isn't insane
    if(!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }
    
    if(this.bulletPool1.countDead() === 0 && this.bulletPool2 === 0) {
      return;
    }
    
    this.nextShotAt = this.time.now + this.shotDelay;
     
    var bullet1 = this.bulletPool1.getFirstExists(false);
    var bullet2 = this.bulletPool2.getFirstExists(false);
    
    bullet1.reset(this.player.x -17, this.player.y -20);
    bullet2.reset(this.player.x +17, this.player.y -20);
    
    bullet1.body.velocity.y = -500;
    bullet2.body.velocity.y = -500;
    
 },
 
  checkCollisions: function () {
    //bullet collision check
    this.physics.arcade.overlap(this.bulletPool1, this.enemyPool, this.enemyHit, null, this);
    
    //player collision check
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
 },
 
  spawnEnemies: function () {
   //enemySpawn set to random
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      
      //DEBUG
      enemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, 
                                          basicGame.ENEMY_HEALTH);
                                          
      //randomize speed
      enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
      enemy.play('fly');
    }
 },
 
  processPlayerInput: function () {
   //reset player velocity after key is let go
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    
    if (this.cursors.left.isDown || this.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player.body.velocity.x = -this.player.speed;
    }
    else if (this.cursors.right.isDown || this.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player.body.velocity.x = this.player.speed;
      
    }
    
    if (this.cursors.up.isDown || this.keyboard.isDown(Phaser.Keyboard.W)) {
      this.player.body.velocity.y = -this.player.speed;
    }
    else if (this.cursors.down.isDown || this.keyboard.isDown(Phaser.Keyboard.S)) {
      this.player.body.velocity.y = this.player.speed;
    }
    
    if (this.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
          
          this.fire();
    }
 },
 
  playerHit: function (player, enemy){
   player.kill();
   this.damgeEnemy(enemy, basicGame.CRASH_DAMAGE);
 },
  
  damageEnemy: function(enemy, damage){
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode('enemy');
    }
  },
 
  explode: function (sprite) {
   if (this.explosionPool.countDead() === 0){
     return;
   } 
   var explosion = this.explosionPool.getFirstExists(false);
   explosion.reset(sprite.x, sprite.y);
   explosion.play('boom', 15, false, true);
   explosion.body.velocity.y = sprite.body.velocity.y;
   explosion.body.velocity.x = sprite.body.velocity.x;
 }

};
