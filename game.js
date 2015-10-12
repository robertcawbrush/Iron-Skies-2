
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemyBullet', 'assets/enemy-bullet.png');
    this.load.image('powerup1', 'assets/powerup1.png');
    this.load.spritesheet('smallTarget', 'assets/enemy.png', 42, 42);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
  },
  
  create: function () {
    
    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupPlayerIcons();
    this.setupText();
 
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
    this.processDelayedEffects();
  },
  
  render: function() {
    //this.game.debug.body(this.player);
  },
  
  setupBackground: function () {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  },
  
  setupPlayer: function () {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.animations.add('ghost', [3, 0, 3, 1], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20,20,0,-5);
    this.weaponLevel = 0;
  },
  
  setupEnemies: function() {
    this.smallTargetPool = this.add.group();
    this.smallTargetPool.enableBody = true;
    this.smallTargetPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.smallTargetPool.createMultiple(30, 'smallTarget');
    this.smallTargetPool.setAll('anchor.x', 0.5);
    this.smallTargetPool.setAll('anchor.y', 0.5);
    this.smallTargetPool.setAll('outOfBoundsKill', true);
    this.smallTargetPool.setAll('checkWorldBounds', true);
    this.smallTargetPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true);
    this.smallTargetPool.setAll('dropRate', BasicGame.ENEMY_DROP_RATE, false, false,0, true);
    
    this.smallTargetPool.forEach(function (enemy) {
      enemy.animations.add('fly', [0,1,2], 20, true);
      enemy.animations.add('hit', [3,1,3,2], 20, false);
      enemy.events.onAnimationComplete.add( function(e){
        e.play('fly');
      }, this);
    });
    
    this.nextEnemyAt = 0;
    this.enemyDelay = 1000;
  },
  
  setupBullets: function() {
    
    //spritegroup
    this.bulletPool = this.add.group();
      
    //enable bullet physics
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
      
    //create 'magazine'
    this.bulletPool.createMultiple(100, 'bullet');
      
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
      
    //destroys bullets if out of world view
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);
    
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
  
  setupPlayerIcons: function () {
    this.powerUpPool = this.add.group();
    this.powerUpPool.enableBody = true;
    this.powerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.powerUpPool.createMultiple(5, 'powerup1');
    this.powerUpPool.setAll('anchor.x', 0.5);
    this.powerUpPool.setAll('anchor.y', 0.5);
    this.powerUpPool.setAll('outOfBoundsKill', true);
    this.powerUpPool.setAll('checkWorldBounds', true);
    this.powerUpPool.setAll('reward', BasicGame.POWERUP_REWARD, false, false, 0, true);
    
    this.lives = this.add.group();
    
    var firstLifeIconX = this.game.width - 10 - (BasicGame.PLAYER_EXTRA_LIVES * 30);
    for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
      life.scale.setTo(0.5, 0.5);
      life.anchor.setTo(0.5, 0.5);
    }
  },
  
  setupText: function () {
    
    this.score = 0;
    this.scoreText = this.add.text(
                                    this.game.width / 2, 30, '' + this.score,
                                    {font: '20 monospace', fill: '#fff', align: 'center' }
                                  );
                                  
    this.scoreText.anchor.setTo(0.5, 0.5);
  },


  enemyHit: function(bullet, enemy) {
    bullet.kill();
    
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  
  },
  
  fire: function() {
    //delay shot so firing rate isn't insane
    if(!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }
    
    this.nextShotAt = this.time.now + this.shotDelay;
     
    var bullet;
    
    if (this.weaponLevel === 0) {
      if (this.bulletPool.countDead() === 0) {
        return;
      }
      
      bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x, this.player.y - 20);
      bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
      
    } else {
      if (this.bulletPool.countDead() < this.weaponLevel * 2) {
        return;
      }
      for (var i = 0; i < this.weaponLevel; i++) {
        bullet = this.bulletPool.getFirstExists(false);
        // spawn left bullet slightly left off center
        bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
        // the left bullets spread from -95 degrees to -135 degrees
        this.physics.arcade.velocityFromAngle( -95 - i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
        
        bullet = this.bulletPool.getFirstExists(false);
        // spawn right bullet slightly right off center
        bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
        // the right bullets spread from -85 degrees to -45
        this.physics.arcade.velocityFromAngle(-85 + i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
      }
    }
    
    bullet.body.velocity.y = -500;
    
 },
 
  checkCollisions: function () {
    //bullet collision check
    this.physics.arcade.overlap(this.bulletPool, this.smallTargetPool, this.enemyHit, null, this);
    
    //player collision check
    this.physics.arcade.overlap(this.player, this.smallTargetPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.powerUpPool, this.playerPowerUp, null, this);
 },
 
  spawnEnemies: function () {
   //enemySpawn set to random for now
    if (this.nextEnemyAt < this.time.now && this.smallTargetPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.smallTargetPool.getFirstExists(false);
      
      //DEBUG
      enemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, BasicGame.ENEMY_HEALTH);
 
      //randomize speed
      enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
      enemy.play('fly');
    }
 },
 
  processPlayerInput: function () {
   //reset player velocity after key is let go
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    
    if(this.player.alive){  
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
    
    }
    
    if (this.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if(this.returnText && this.returnText.exists) {
          this.quitGame();
        } else {
          this.fire();
        }
          
    }
 },
 
  processDelayedEffects: function () {
   if(this.ghostUntil && this.ghostUntil < this.time.now) {
     this.ghostUntil = null;
     this.player.play('fly');
   }
   
   if(this.showReturn && this.time.now > this.showReturn && !this.returnText){
     this.returnText = this.add.text(
      this.game.width / 2, this.game.height / 2 + 100,
      'Press Space to return to the main Menu',
      { font: '26px serif', fill: '#fff'}
      );
      this.returnText.anchor.setTo(0.5, 0.5);
   }
   
  },
 
  playerHit: function (player, enemy){
    if(this.ghostUntil && this.ghostUntil > this.time.now) {
      return;
    }
  
   this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
   
   var life = this.lives.getFirstAlive();
   if(life !== null) {
     life.kill();
     this.weaponLevel = 0;
     this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
     this.player.play('ghost');
     this.player.reset(this.game.width / 2, this.game.height - 50, 0 , 1);
   } else {
     this.explode(player);
     player.kill();
     this.displayEnd(false);
   }
 },
  
  damageEnemy: function(enemy, damage){
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.spawnPowerUp(enemy);
      this.addToScore(BasicGame.ENEMY_REWARD);
    }
  },
  
  addToScore: function (reward) {
    this.score += reward;
    this.scoreText.text = this.score;
    
    if (this.score >= 100) {
      this.smallTargetPool.destroy();
      this.displayEnd(true);
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
  },
 
  spawnPowerUp: function (enemy) {
   if(this.powerUpPool.countDead() === 0 || this.weaponLevel === 5) {
     return;
   }
   
   if (this.rnd.frac() < enemy.dropRate) {
     var powerUp = this.powerUpPool.getFirstExists(false);
     powerUp.reset(enemy.x, enemy.y);
     powerUp.body.velocity.y = BasicGame.POWERUP_VELOCTIY;
   }
  },
  
  playerPowerUp: function (player, powerUp) {
    this.addToScore(powerUp.reward);
    powerUp.kill();
    if (this.weaponLevel < 5) {
      this.weaponLevel++;
    }
  },
 
  displayEnd: function(win) {
    if (this.endText && this.endText.exists){
      return;
    }
    
    var msg = win ? 'VICTORY' : 'DEFEAT';
    this.endText = this.add.text(
                                  this.game.width / 2, this.game.height / 2,
                                  msg, 
                                  {font: '72px serif', fill: '#fff'}
                                );
    this.endText.anchor.setTo(0.5, 0);
    
    this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
  },
  
  quitGame: function(pointer) {
    this.sea.destroy();
    this.player.destroy();
    this.smallTargetPool.destroy();
    this.bulletPool.destroy();
    this.explosionPool.destroy();
    this.scoreText.destroy();
    this.returnText.destroy();
    this.endText.destroy();
    
    this.state.start('MainMenu');
  }

};
