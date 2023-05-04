import Phaser from "phaser";
import BubbleText from "./BubbleText";
import { Agent } from "generative-agents";
import { locations } from "../data/world";

class AgentCharacter extends Phaser.GameObjects.Sprite {
  private agent: Agent;

  private bubbleText: BubbleText;

  constructor(
    scene: Phaser.Scene,
    agent: Agent,
    sprite: string,
    x: number,
    y: number
  ) {
    super(scene, x, y, sprite);
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
      key: `${this.agent.id}_idle`,
      frames: anims.generateFrameNumbers(this.agent.id, { start: 75, end: 80 }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: `${this.agent.id}_walk_down`,
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 132,
        end: 137,
      }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: `${this.agent.id}_walk_up`,
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 122,
        end: 127,
      }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: `${this.agent.id}_walk_left`,
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 127,
        end: 132,
      }),
      frameRate: 6,
      repeat: -1,
    });

    anims.create({
      key: `${this.agent.id}_walk_right`,
      frames: anims.generateFrameNumbers(this.agent.id, {
        start: 116,
        end: 121,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  update() {
    this.updateAgentLocation();

    // Update the bubble text position
    this.bubbleText.x = this.x + 10;
    this.bubbleText.y = this.y - 50;

    // update the bubble text content
    this.bubbleText.updateText(
      `${this.getAgentInitials()}: ${this.agent.action.emoji}`
    );
  }

  // Add a method to update the bubble text content
  updateBubbleText(text: string) {
    this.bubbleText.updateText(text);
  }

  getAgentInitials() {
    return this.agent.id
      .split("_")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  updateAgentLocation() {
    const targetLocation = locations.find(
      (location) => location.name === this.agent.location
    );

    if (!targetLocation) {
      this.anims.play(`${this.agent.id}_idle`, true);
      return;
    }

    const targetX = targetLocation.x + targetLocation.width / 2;
    const targetY = targetLocation.y + targetLocation.height / 2;

    const tolerance = 2; // Tolerance value to determine if the agent is close enough to the target position

    if (
      Math.abs(this.x - targetX) > tolerance ||
      Math.abs(this.y - targetY) > tolerance
    ) {
      // Move vertically first
      if (Math.abs(this.y - targetY) > tolerance) {
        const verticalDirection = this.y < targetY ? "down" : "up";
        this.moveCharacter(verticalDirection);
      }
      // Move horizontally after reaching the target Y position
      else {
        const horizontalDirection = this.x < targetX ? "right" : "left";
        this.moveCharacter(horizontalDirection);
      }
    } else {
      this.anims.play(`${this.agent.id}_idle`, true);
    }
  }

  moveCharacter(direction: string) {
    switch (direction) {
      case "up":
        this.y -= 0.8;
        this.anims.play(`${this.agent.id}_walk_up`, true);
        break;
      case "down":
        this.y += 0.8;
        this.anims.play(`${this.agent.id}_walk_down`, true);
        break;
      case "left":
        this.x -= 0.8;
        this.anims.play(`${this.agent.id}_walk_left`, true);
        break;
      case "right":
        this.x += 0.8;
        this.anims.play(`${this.agent.id}_walk_right`, true);
        break;
    }
  }
}

export default AgentCharacter;
