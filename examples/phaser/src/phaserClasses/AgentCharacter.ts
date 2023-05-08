import Phaser from "phaser";
import BubbleText from "./BubbleText";
import { Agent, AgentEvents } from "generative-agents";
import { locations } from "../data/world";

class AgentCharacter extends Phaser.GameObjects.Sprite {
  private agent: Agent;

  private bubbleText: BubbleText;

  // target coordinates for the agent to move to
  private targetX = 0;
  private targetY = 0;

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

    // add event listeners for agent event
    this.agent.on(AgentEvents.TASK_FINISHED, this.updateAgentLocation);

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
    // if not moving, play idle animation
    if (this.targetX === 0 && this.targetY === 0) {
      this.play(`${this.agent.id}_idle`, true);
    }

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

  updateAgentLocation = () => {
    const targetLocation = locations.find(
      (location) => location.name === this.agent.location
    );

    if (!targetLocation) {
      // agent is already moving
      return;
    }

    const offsetX =
      Math.floor(Math.random() * targetLocation.width) -
      targetLocation.width / 2;
    const offsetY =
      Math.floor(Math.random() * targetLocation.height) -
      targetLocation.height / 2;

    this.targetX = targetLocation.x + targetLocation.width / 2 + offsetX;
    this.targetY = targetLocation.y + targetLocation.height / 2 + offsetY;

    const distanceX = Math.abs(this.x - this.targetX);
    const distanceY = Math.abs(this.y - this.targetY);

    const durationX = distanceX;
    const durationY = distanceY;

    this.scene.tweens.add({
      targets: this,
      y: this.targetY,
      duration: durationY * 5,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          x: this.targetX,
          duration: durationX * 5,
          onComplete: () => {
            this.anims.play(`${this.agent.id}_idle`, true);
            this.agent.executeCurrentTask();
          },
        });
      },
    });
  };

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
