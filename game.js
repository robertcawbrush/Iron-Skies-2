
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('smallEnemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
  },
  
  
  create: function () {

    this.sea = this.add.tileSprite(0, 0, 800, 600, 'sea');
    
    this.player = this.add.sprite(400, 550, 'player');
    this.player.anchor.setTo(0.5,0.5);
    this.player.animations.add('fly', [0,1,2], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;
    
    //create and set smallPlane Bodies
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    
    this.enemyPool.createMultiple (5, 'smallEnemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    
    //set animations for small Enemy Planes
    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly',[0,1,2], 20, true);
    });
    
    this.nextEnemyAt = 0;
    this.enemyDelay = 100;
    
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
    
    //establishes firing rate
    this.nextShotAt = 0;
    this.shotDelay = 150;
    
    //input inits
      //arrow keys
      this.cursors = this.input.keyboard.createCursorKeys();
      
      //everything else
      this.keyboard = this.input.keyboard;
  },

  update: function () {
    //scroll map
    this.sea.tilePosition.y += 1;
    
    //bullet collision check
    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    
    //enemySpawn set to random
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      
      //DEBUG
      enemy.reset(this.rnd.integerInRange(20, 780), 0);
      //randomize speed
      enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
      enemy.play('fly');
    }
    
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
  
  render: function() {
  },

  quitGame: function (pointer) {



    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  },

  enemyHit: function(bullet, enemy) {
    bullet.kill();
    enemy.kill();
    
    var explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('boom');
    explosion.play('boom', 15,false, true);
  },
  
  fire: function() {
    //delay shot so firing rate isn't insane
    if(this.nextShotAt > this.time.now) {
      return;
    }
    
    if(this.bulletPool.countDead() === 0) {
      return;
    }
    
    this.nextShotAt = this.time.now + this.shotDelay;
     
    var bullet = this.bulletPool.getFirstExists(false);
    
    bullet.reset(this.player.x, this.player.y -20);
    
    bullet.body.velocity.y = -500;
    
 }

};
