
BasicGame.MainMenu = function (game) {

  this.music = null;
  this.playButton = null;

};

BasicGame.MainMenu.prototype = {
  
  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    this.load.image('titlePage', 'assets/ironSkiesTitle.png');
  }, 

  create: function () {

    this.setupBackground();
    this.add.sprite(0, 0, 'titlePage');

    this.loadingText = this.add.text(this.game.width / 2 - 15, this.game.height / 2 + 100, "Press Space to start", { font: "20px monospace", fill: "#fff" });
    this.loadingText.anchor.setTo(0.5, 0.5);

  },

  update: function () {

    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.startGame();
    }

  },

  startGame: function (pointer) {

    this.state.start('Game');

  },
  setupBackground: function () {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  }

};
