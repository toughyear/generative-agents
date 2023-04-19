import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

interface Props {
  emoji: string;
}

const PhaserGame: React.FC<Props> = ({ emoji }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const bubbleTextRef = useRef<Phaser.GameObjects.Text | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // Declare the bubbleText variable inside the useEffect
    let bubble: Phaser.GameObjects.Graphics;

    let mysprite: Phaser.GameObjects.Sprite;

    const config = {
      type: Phaser.AUTO,
      width: 800 * 1.5,
      height: 480 * 1.5,
      backgroundColor: "#FEEFC4",
      parent: gameRef.current,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      style: "margin: auto",
    };

    phaserGameRef.current = new Phaser.Game(config);

    const game = phaserGameRef.current;

    function preload() {
      // Add your preload logic here
      game.scene.scenes[0].load.image(
        "background",
        "./images/overall_76380x4320.png"
      );

      game.scene.scenes[0].load.spritesheet("char1", "char1.png", {
        frameWidth: 48,
        frameHeight: 48,
      });

      game.scene.scenes[0].load.audio("bgm", "./bgm.mp3");
    }

    function create() {
      // Add your create logic here
      // Add the image as a background
      game.scene.scenes[0].add.image(
        config.width / 2,
        config.height / 2,
        "background"
      );

      const text = game.scene.scenes[0].add.text(10, 10, "Begin Simulation!");
      text.setFont("VT323").setFontSize(24).setFill("#fff");

      mysprite = game.scene.scenes[0].add.sprite(
        config.width / 2,
        config.height / 2,
        "char1"
      );

      game.scene.scenes[0].anims.create({
        key: "walk_down",
        frames: game.scene.scenes[0].anims.generateFrameNumbers("char1", {
          start: 0,
          end: 3,
        }),
        frameRate: 4,
        repeat: -1,
      });

      game.scene.scenes[0].anims.create({
        key: "walk_up",
        frames: game.scene.scenes[0].anims.generateFrameNumbers("char1", {
          start: 4,
          end: 7,
        }),
        frameRate: 4,
        repeat: -1,
      });

      game.scene.scenes[0].anims.create({
        key: "walk_left",
        frames: game.scene.scenes[0].anims.generateFrameNumbers("char1", {
          start: 8,
          end: 11,
        }),
        frameRate: 4,
        repeat: -1,
      });

      game.scene.scenes[0].anims.create({
        key: "walk_right",
        frames: game.scene.scenes[0].anims.generateFrameNumbers("char1", {
          start: 12,
          end: 15,
        }),
        frameRate: 4,
        repeat: -1,
      });

      mysprite.setScale(2);

      // Create the bubble graphics object
      bubble = game.scene.scenes[0].add.graphics();
      bubble.fillStyle(0xffffff, 1);
      bubble.fillRoundedRect(0, 0, 100, 50, 5);
      bubble.lineStyle(2, 0x000000);
      bubble.strokeRoundedRect(0, 0, 100, 50, 5);

      // Create the text object with the emoji
      bubbleTextRef.current = game.scene.scenes[0].add.text(25, 10, emoji);
      // change font family to serif
      bubbleTextRef.current.setFont("serif");
      bubbleTextRef.current.setFontSize(24).setFill("#000");

      // Play the music
      const bgm = game.scene.scenes[0].sound.add("bgm", {
        loop: true,
      });
      bgm.play();
    }

    let directionChangeCounter = 0;
    let currentDirection = "right";

    function randomDirection() {
      const directions = ["up", "down", "left", "right"];
      return directions[Math.floor(Math.random() * directions.length)];
    }

    function update() {
      // Add your update logic here
      directionChangeCounter++;

      if (directionChangeCounter >= 60) {
        currentDirection = randomDirection();
        directionChangeCounter = 0;
      }

      switch (currentDirection) {
        case "up":
          mysprite.y -= 0.8;
          mysprite.anims.play("walk_up", true);
          break;
        case "down":
          mysprite.y += 0.8;
          mysprite.anims.play("walk_down", true);
          break;
        case "left":
          mysprite.x -= 0.8;
          mysprite.anims.play("walk_left", true);
          break;
        case "right":
          mysprite.x += 0.8;
          mysprite.anims.play("walk_right", true);
          break;
      }

      // Keep the character inside the canvas
      mysprite.x = Phaser.Math.Clamp(
        mysprite.x,
        50,
        config.width - mysprite.displayWidth / 2
      );
      mysprite.y = Phaser.Math.Clamp(
        mysprite.y,
        50,
        config.height - mysprite.displayHeight / 2
      );

      // Update the bubble position
      bubble.x = mysprite.x + mysprite.displayWidth / 2 - 50;
      bubble.y = mysprite.y - mysprite.displayHeight / 2 - 60;

      // Update the emoji text position using bubbleTextRef.current
      if (bubbleTextRef.current) {
        bubbleTextRef.current.x = bubble.x + 25;
        bubbleTextRef.current.y = bubble.y + 10;
      }

      // Create a variable for the camera
      const camera = game.scene.scenes[0].cameras.main;

      if (game.scene.scenes[0].input.keyboard === null) {
        return;
      }

      // Create a variable for the cursors
      const cursors = game.scene.scenes[0].input.keyboard.createCursorKeys();

      // Create custom keys for WASD movement
      const keyW = game.scene.scenes[0].input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.W
      );
      const keyA = game.scene.scenes[0].input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.A
      );
      const keyS = game.scene.scenes[0].input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.S
      );
      const keyD = game.scene.scenes[0].input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.D
      );

      // Camera movement with WASD keys
      if (keyW.isDown) {
        camera.scrollY -= 2;
      }
      if (keyA.isDown) {
        camera.scrollX -= 2;
      }
      if (keyS.isDown) {
        camera.scrollY += 2;
      }
      if (keyD.isDown) {
        camera.scrollX += 2;
      }

      // Camera movement with arrow keys
      if (cursors.up.isDown) {
        camera.scrollY -= 2;
      }
      if (cursors.left.isDown) {
        camera.scrollX -= 2;
      }
      if (cursors.down.isDown) {
        camera.scrollY += 2;
      }
      if (cursors.right.isDown) {
        camera.scrollX += 2;
      }
    }

    return () => {
      phaserGameRef.current?.destroy(true);
    };
  }, []);

  // New useEffect hook that triggers when the emoji prop changes
  useEffect(() => {
    if (!phaserGameRef.current) return;

    const game = phaserGameRef.current;

    if (game) {
      if (bubbleTextRef.current) {
        bubbleTextRef.current.setText(emoji);
        console.log("Emoji changed to: ", emoji);
      }
    }
  }, [emoji]);

  return <div ref={gameRef} className='flex justify-center mt-10'></div>;
};

export default PhaserGame;
