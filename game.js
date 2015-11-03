
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
  
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
    this.enemyFire();
    this.processPlayerInput();
    this.processDelayedEffects();
  },
  
  render: function() {
    //DEBUG HITBOXES
      //this.game.debug.body(this.player);
      
      this.bossEnemyPool.forEach(function (enemy) {
        this.game.debug.body(enemy);
      }, this);
  },
  
  setupBackground: function () {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  },
  
  setupPlayer: function () {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [0], 20, true);
    this.player.animations.add('ghost', [0, 1], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20,35,0,-5);
    this.weaponLevel = 0;
  },
  
  setupEnemies: function() {
    //smallTarget properties  
      this.smallTargetPool = this.add.group();
      this.smallTargetPool.enableBody = true;
      this.smallTargetPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.smallTargetPool.createMultiple(30, 'smallTarget');
      this.smallTargetPool.setAll('anchor.x', 0.5);
      this.smallTargetPool.setAll('anchor.y', 0.5);
      this.smallTargetPool.setAll('outOfBoundsKill', true);
      this.smallTargetPool.setAll('checkWorldBounds', true);
      this.smallTargetPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true);
      this.smallTargetPool.setAll('dropRate', BasicGame.ENEMY_DROP_RATE, false, false, 0, true);
      
      //smallTarget Animations
      this.smallTargetPool.forEach(function (enemy) {
        enemy.animations.add('fly', [0, 1, 2], 20, true);
        enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
        
        enemy.events.onAnimationComplete.add( function(e){
          e.play('fly');
        }, this);
        
      });
      
      this.nextEnemyAt = 0;
      this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;
      
    //Shooter capable enemyplanes(smallShooter)
      this.shooterPool = this.add.group();
      this.shooterPool.enableBody = true;
      this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
      this.shooterPool.createMultiple(20, 'smallShooter');
      this.shooterPool.setAll('anchor.x', 0.5);
      this.shooterPool.setAll('anchor.y', 0.5);
      this.shooterPool.setAll('outOfBoundsKill', true);
      this.shooterPool.setAll('checkWorldBounds', true);
      this.shooterPool.setAll('reward', BasicGame.SHOOTER_REWARD, false, false, 0, true);
      this.shooterPool.setAll('dropRate', BasicGame.SHOOTER_DROP_RATE, false, false, 0, true);
      
      //smallShooter Animations
      this.shooterPool.forEach(function (enemy) {
        enemy.animations.add('fly', [0,1,2], 20, true);
        enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
        
        enemy.events.onAnimationComplete.add( function(e){
          e.play('fly');
        }, this);
        
      });
      
      //shooter properties
      this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 1; //sets time elapsed until shooters spawn
      this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;
    
    //boss properties
      this.bossEnemyPool = this.add.group();
      this.bossEnemyPool.enableBody = true;
      this.bossEnemyPool.physicsBodyType = Phaser.Physics.P2;
      this.bossEnemyPool.createMultiple(1, 'bossEnemy');
      this.bossEnemyPool.setAll('anchor.x', 0.5);
      this.bossEnemyPool.setAll('anchor.y', 0.5);
      this.bossEnemyPool.setAll('outOfBoundsKill', true);
      this.bossEnemyPool.setAll('checkWorldBounds', true);
      this.bossEnemyPool.setAll('reward', BasicGame.BOSS_REWARD, false, false, 0, true);
      this.bossEnemyPool.setAll('dropRate', BasicGame.BOSS_DROP_RATE, false, false, 0, true);
      
      //boss animations
      this.bossEnemyPool.forEach(function (boss) {
        boss.animations.add('fly', [0, 1, 1], 20, true);
        boss.animations.add('hit', [1, 3, 2, 0], 20, false);
        
        boss.events.onAnimationComplete.add( function (b) {
          b.play('fly');
        } ,this);
        
      });
      
      this.bossEnemy = this.bossEnemyPool.getTop();
      this.bossUnlocked = false;
  },
  
  setupBullets: function() {
    //Player Bullets
      //spritegroup
      this.bulletPool = this.add.group();
        
      //enable bullet physics
      this.bulletPool.enableBody = true;
      this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        
      //create 'magazine'
      this.bulletPool.createMultiple(150, 'bullet');
      
      //change anchorPoint to center of sprite
      this.bulletPool.setAll('anchor.x', 0.5);
      this.bulletPool.setAll('anchor.y', 0.5);
        
      //destroys bullets if out of world view
      this.bulletPool.setAll('outOfBoundsKill', true);
      this.bulletPool.setAll('checkWorldBounds', true);
      
      //establish firing rate
      this.nextShotAt = 0;
      this.shotDelay = 130;
      
    //Enemy Bullets
      //spriteGroup
      this.smallShooterBulletPool = this.add.group();
      
      //enable bullet physics
      this.smallShooterBulletPool.enableBody = true;
      this.smallShooterBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
      
      //create 'magazine'
      this.smallShooterBulletPool.createMultiple(100, 'enemyBullet');
        
      //change anchorPoint to center of sprite
      this.smallShooterBulletPool.setAll('anchor.x', 0.5);
      this.smallShooterBulletPool.setAll('anchor.y', 0.5);
      
      //destroys bullets if out of world view
      this.smallShooterBulletPool.setAll('outOfBoundsKill', true);
      this.smallShooterBulletPool.setAll('checkWorldBounds', true);
      this.smallShooterBulletPool.setAll('reward', 0, false, false, 0, true);
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
  
  enemyFire: function() {
    //cycle through each enemy capable of firing that is alive
    this.shooterPool.forEachAlive(function (enemy) {
      //check enemy to see if just fired to prevent insane firing rate
      if (this.time.now > enemy.nextShotAt && this.smallShooterBulletPool.countDead() > 0) {
        var bullet = this.smallShooterBulletPool.getFirstExists(false);
        //fires bullet from enemies AnchorPoint
        bullet.reset(enemy.x, enemy.y);
        //moves bullet to player location
        this.physics.arcade.moveToObject(bullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY);
        enemy.nextShotAt = this.time.now + BasicGame.SHOOTER_SHOT_DELAY
      }
    }, this);
    
    this.bossFire();
  },
  
  fire: function() {
    
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
      bullet.reset(this.player.x, this.player.y - 30);
      bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
      
    } else {
      if (this.bulletPool.countDead() < this.weaponLevel * 2) {
        return;
      }
      for (var i = 0; i < this.weaponLevel; i++) {
        bullet = this.bulletPool.getFirstExists(false);
        // spawn left bullet slightly left off center
        bullet.reset(this.player.x - (10 + i * 6), this.player.y - 30);
        // the left bullets spread from -95 degrees to -135 degrees
        this.physics.arcade.velocityFromAngle( -95 - i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
        
        bullet = this.bulletPool.getFirstExists(false);
        // spawn right bullet slightly right off center
        bullet.reset(this.player.x + (10 + i * 6), this.player.y - 30);
        // the right bullets spread from -85 degrees to -45
        this.physics.arcade.velocityFromAngle(-85 + i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
      }
    }
    
    bullet.body.velocity.y = -500;
    
 },
 
  checkCollisions: function () {
    //bullet collision check
    this.physics.arcade.overlap(this.bulletPool, this.smallTargetPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.bulletPool, this.shooterPool, this.enemyHit, null, this);
    
    //player collision check
    this.physics.arcade.overlap(this.player, this.smallTargetPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.smallShooterBulletPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.powerUpPool, this.playerPowerUp, null, this);
    
    this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);
    
    //protects boss from being hit until fully deployed on screen
    if(this.bossUnlocked === false) {
      this.physics.arcade.overlap(this.bulletPool, this.bossEnemyPool, this.enemyHit, null, this);
      
      this.physics.arcade.overlap(this.player, this.bossEnemyPool, this.playerHit, null, this);
    }
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
    
    if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
      this.nextShooterAt = this.time.now + this.shooterDelay;
      var shooter = this.shooterPool.getFirstExists(false);
      
      //Random spawn near top of field(DEBUG WILL BE SCRIPTED IN FUTURE)
        shooter.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, BasicGame.SHOOTER_HEALTH);
        
      //target desitnation
        var target = this.rnd.integerInRange(20,this.game.width - 20);
        
      //Move to destination and sets shooter facing right direction
        shooter.rotation = this.physics.arcade.moveToXY(shooter,target,this.game.height,
        this.rnd.integerInRange(BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY)
        ) - Math.PI / 2;
        
      //tell animation to play
      shooter.play('fly');
      
      //shooter timer property
      shooter.nextShotAt = 0;
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
   //Player Effects
     if(this.ghostUntil && this.ghostUntil < this.time.now) {
       this.ghostUntil = null;
       this.player.play('fly');
     }
   
   //Boss Effects
    if (this.bossUnlocked && this.bossEnemy.y > 80) {
      this.bossUnlocked = false;
      this.bossEnemy.nextShotAt = 0;
      
      this.bossEnemy.body.velocity.y = 0;
      this.bossEnemy.body.velocity.s = BasicGame.BOSS_X_VELOCITY;
      
      //these two lines keep the boss on the canvas and bounces the boss off the walls
      this.bossEnemy.body.bounce.x = 1;
      this.bossEnemy.body.collideWorldBounds = true;
    }
   
   //Game Effects
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
    if(this.ghostUntil && this.ghostUntil > this.time.now || this.returnText && this.returnText.exists) {
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
      this.addToScore(enemy.reward);
      
      //Boss death handler
        if(enemy.key === 'bossEnemy') {
          this.bossEnemyPool.destroy();
          this.displayEnd(true);
        }
    }
  },
  
  addToScore: function (reward) {
    this.score += reward;
    this.scoreText.text = this.score;
    
    if (this.score >= BasicGame.DEBUG_SPAWN_SCORE && this.bossEnemyPool.countDead() === 1) {
      this.enemyFlee();
      this.spawnBossEnemy();
    }
  },
  
  spawnBossEnemy: function () {
    this.bossUnlocked = true;
    this.bossEnemy.reset(this.game.width / 2, -40, BasicGame.BOSS_HEALTH);
    this.physics.enable(this.bossEnemy, Phaser.Physics.ARCADE);
    this.bossEnemy.body.velocity.y = BasicGame.BOSS_Y_VELOCITY;
    this.bossEnemy.play('fly');
  },
  
  enemyFlee: function () {
    //purpose of this function is to change the small enemy pools to fly off screen instead
    //of dissapearing like they currently do
    this.smallTargetPool.destroy(); //DEBUG
    this.shooterPool.destroy(); //DEBUG
  },
  
  bossFire: function () {
    if (this.bossUnlocked === false && this.bossEnemy.alive && this.bossEnemy.nextShotAt < this.time.now 
    && this.smallShooterBulletPool.countDead() >= 10) {
      
        this.bossEnemy.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY1;
      
      for (var i = 0; i < 5; i++) {
        var leftBullet = this.smallShooterBulletPool.getFirstExists(false);
        leftBullet.reset(this.bossEnemy.x + 90 + i * 10, this.bossEnemy.y + 70);
        var rightBullet = this.smallShooterBulletPool.getFirstExists(false);
        rightBullet.reset(this.bossEnemy.x - 100 + i * 10, this.bossEnemy.y + 70);
        
         if(this.bossEnemy.health > BasicGame.BOSS_HEALTH / 2){
          //Phase 1 of boss fight
          rightBullet.body.velocity.y = BasicGame.ENEMY_BULLET_VELOCITY;
          rightBullet.body.velocity.x = i * 120;
          leftBullet.body.velocity.y = BasicGame.ENEMY_BULLET_VELOCITY;
          leftBullet.body.velocity.x = i * 120;
         } else {
          //Phase 2 of boss fight
          this.physics.arcade.moveToXY(rightBullet, this.player.x + i * 100, this.player.y, 
            BasicGame.ENEMY_BULLET_VELOCITY
          );
          this.physics.arcade.moveToXY(leftBullet, this.player.x + i * 100, this.player.y, 
            BasicGame.ENEMY_BULLET_VELOCITY
          );
         }
      
        
      }//end for
    }//end function requirement check
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
    //handles Power up actions and cleanup
    this.addToScore(powerUp.reward);
    powerUp.kill();
    if (this.weaponLevel < 5) {
      this.weaponLevel++;
    }
  },
 
  displayEnd: function(win) {
    //check if text already exists
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
    //Destroy all assets to cleanup screen and memory
    this.sea.destroy();
    this.player.destroy();
    this.smallTargetPool.destroy();
    this.shooterPool.destroy();
    this.bossEnemyPool.destroy();
    this.bulletPool.destroy();
    this.smallShooterBulletPool.destroy();
    this.explosionPool.destroy();
    this.scoreText.destroy();
    this.returnText.destroy();
    this.endText.destroy();
    
    this.state.start('MainMenu');
  }

};
