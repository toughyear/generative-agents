import Phaser from "phaser";
import BubbleText from "./BubbleText";
import { AgentInitData } from "../data/agents";

class AgentCharacter extends Phaser.GameObjects.Sprite {
  private agent: AgentInitData;

  private directionChangeCounter = 0;
  private currentDirection = "right";
  private bubbleText: BubbleText;

  constructor(scene: Phaser.Scene, x: number, y: number, agent: AgentInitData) {
    super(scene, x, y, agent.sprite);
    this.agent = agent;
    scene.add.existing(this);
    this.createAnimations();
    this.bubbleText = new BubbleText(
      scene,
      x,
      y - 20,
      `${this.getAgentInitials()}: 👀`
    );
  }

  createAnimations() {
    const anims = this.scene.anims;

    anims.create({
      key: "idle",
      frames: anims.generateFrameNumbers(this.agent.id, { start: 48, end: 53 }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: "walk_down",
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 132,
        end: 137,
      }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: "walk_up",
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 122,
        end: 127,
      }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: "walk_left",
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 127,
        end: 132,
      }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: "walk_right",
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 116,
        end: 121,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  update() {
    this.directionChangeCounter++;

    if (this.directionChangeCounter >= 60) {
      this.currentDirection = this.randomDirection();
      this.directionChangeCounter = 0;
    }

    switch (this.currentDirection) {
      case "up":
        this.y -= 0.8;
        this.anims.play("walk_up", true);
        break;
      case "down":
        this.y += 0.8;
        this.anims.play("walk_down", true);
        break;
      case "left":
        this.x -= 0.8;
        this.anims.play("walk_left", true);
        break;
      case "right":
        this.x += 0.8;
        this.anims.play("walk_right", true);
        break;
    }

    // Update the bubble text position
    this.bubbleText.x = this.x + 10;
    this.bubbleText.y = this.y - 50;
  }

  // Add a method to update the bubble text content
  updateBubbleText(text: string) {
    this.bubbleText.updateText(text);
  }

  private randomDirection() {
    const directions = ["up", "down", "left", "right"];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  private getAgentInitials() {
    return this.agent.id
      .split("_")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
}

export default AgentCharacter;
