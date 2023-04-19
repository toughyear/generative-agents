import Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  private mysprite: Phaser.GameObjects.Sprite | null = null;
  private bubble: Phaser.GameObjects.Graphics | null = null;
  private bubbleText: Phaser.GameObjects.Text | null = null;
  private directionChangeCounter = 0;
  private currentDirection = "right";
  private cameraScrollSpeed = 8;

  private keyW: Phaser.Input.Keyboard.Key | null = null;
  private keyA: Phaser.Input.Keyboard.Key | null = null;
  private keyS: Phaser.Input.Keyboard.Key | null = null;
  private keyD: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.load.image("background", "./images/background.png");

    this.load.spritesheet("char1", "char1.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.audio("bgm", "./bgm.mp3");
  }

  create() {
    const { width, height } = this.sys.game.config;

    // infer width and height are numbers
    if (typeof width !== "number" || typeof height !== "number") {
      throw new Error("width and height must be numbers");
    }

    const bg = this.add.image(0, 0, "background");
    bg.setOrigin(0, 0);
    this.cameras.main.setBounds(0, 0, bg.width, bg.height); // Set camera bounds to the background image size

    const text = this.add.text(10, 10, "Begin Simulation!");
    text.setFont("VT323").setFontSize(24).setFill("#fff");

    this.mysprite = this.add.sprite(width / 2, height / 2, "char1");
    this.createAnimations();

    this.mysprite.setScale(2);

    this.createBubble();
    this.playBackgroundMusic();
    this.setupZoom();
    this.setupKeyboard();
  }

  update() {
    this.updateCharacterMovement();
    this.updateBubblePosition();
    this.cameraMovement();
  }

  updateEmoji(emoji: string) {
    if (this.bubbleText) {
      this.bubbleText.setText(emoji);
      console.log("Emoji changed to: ", emoji);
    }
  }

  private createAnimations() {
    const anims = this.anims;

    anims.create({
      key: "walk_down",
      frames: anims.generateFrameNumbers("char1", { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });

    anims.create({
      key: "walk_up",
      frames: anims.generateFrameNumbers("char1", { start: 4, end: 7 }),
      frameRate: 4,
      repeat: -1,
    });

    anims.create({
      key: "walk_left",
      frames: anims.generateFrameNumbers("char1", { start: 8, end: 11 }),
      frameRate: 4,
      repeat: -1,
    });

    anims.create({
      key: "walk_right",
      frames: anims.generateFrameNumbers("char1", { start: 12, end: 15 }),
      frameRate: 4,
      repeat: -1,
    });
  }

  private createBubble() {
    this.bubble = this.add.graphics();
    this.bubble.fillStyle(0xffffff, 1);
    this.bubble.fillRoundedRect(0, 0, 100, 50, 5);
    this.bubble.lineStyle(2, 0x000000);
    this.bubble.strokeRoundedRect(0, 0, 100, 50, 5);

    this.bubbleText = this.add.text(25, 10, "");
    this.bubbleText.setFont("serif");
    this.bubbleText.setFontSize(24).setFill("#000");
  }

  private playBackgroundMusic() {
    const bgm = this.sound.add("bgm", {
      loop: true,
    });
    bgm.play();
  }

  private updateCharacterMovement() {
    this.directionChangeCounter++;

    if (this.directionChangeCounter >= 60) {
      this.currentDirection = this.randomDirection();
      this.directionChangeCounter = 0;
    }

    if (!this.mysprite) return;

    switch (this.currentDirection) {
      case "up":
        this.mysprite.y -= 0.8;
        this.mysprite.anims.play("walk_up", true);
        break;
      case "down":
        this.mysprite.y += 0.8;
        this.mysprite.anims.play("walk_down", true);
        break;
      case "left":
        this.mysprite.x -= 0.8;
        this.mysprite.anims.play("walk_left", true);
        break;
      case "right":
        this.mysprite.x += 0.8;
        this.mysprite.anims.play("walk_right", true);
        break;
    }

    const { width, height } = this.sys.game.config;

    // infer width and height are numbers
    if (typeof width !== "number" || typeof height !== "number") {
      throw new Error("width and height must be numbers");
    }

    this.mysprite.x = Phaser.Math.Clamp(
      this.mysprite.x,
      50,
      width - this.mysprite.displayWidth / 2
    );
    this.mysprite.y = Phaser.Math.Clamp(
      this.mysprite.y,
      50,
      height - this.mysprite.displayHeight / 2
    );
  }

  private randomDirection() {
    const directions = ["up", "down", "left", "right"];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  private updateBubblePosition() {
    if (!this.mysprite || !this.bubble || !this.bubbleText) return;

    this.bubble.x = this.mysprite.x + this.mysprite.displayWidth / 2 - 50;
    this.bubble.y = this.mysprite.y - this.mysprite.displayHeight / 2 - 60;

    this.bubbleText.x = this.bubble.x + 25;
    this.bubbleText.y = this.bubble.y + 10;
  }

  /**
   * allows moving camera using WASD or arrow keys
   */
  private cameraMovement() {
    if (!this.input.keyboard) {
      return;
    }
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown || (this.keyA && this.keyA.isDown)) {
      this.cameras.main.scrollX -= this.cameraScrollSpeed;
    }

    if (cursors.right.isDown || (this.keyD && this.keyD.isDown)) {
      this.cameras.main.scrollX += this.cameraScrollSpeed;
    }

    if (cursors.up.isDown || (this.keyW && this.keyW.isDown)) {
      this.cameras.main.scrollY -= this.cameraScrollSpeed;
    }

    if (cursors.down.isDown || (this.keyS && this.keyS.isDown)) {
      this.cameras.main.scrollY += this.cameraScrollSpeed;
    }
    // Clamp the camera scroll values within the bounds
    this.cameras.main.scrollX = Phaser.Math.Clamp(
      this.cameras.main.scrollX,
      0,
      this.cameras.main.getBounds().width - this.cameras.main.width
    );
    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.cameras.main.scrollY,
      0,
      this.cameras.main.getBounds().height - this.cameras.main.height
    );
  }

  /**
   * Setup the zoom functionality using mouse scroll
   */
  private setupZoom() {
    this.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number
        // _deltaZ: number
      ) => {
        if (deltaY > 0) {
          this.cameras.main.zoom *= 0.9; // Zoom out
        } else if (deltaY < 0) {
          this.cameras.main.zoom *= 1.1; // Zoom in
        }

        // Cap the zoom level within a range
        this.cameras.main.zoom = Phaser.Math.Clamp(
          this.cameras.main.zoom,
          0.5,
          2
        );
      }
    );
  }

  private setupKeyboard() {
    if (!this.input.keyboard) {
      return;
    }
    // Add WASD keys to input.keyboard
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }
}
