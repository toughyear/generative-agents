import Phaser from "phaser";
import { Agent } from "generative-agents";
import AgentCharacter from "../phaserClasses/AgentCharacter";
import { agentsData } from "../data/agents";
import { locations } from "../data/world";

// declare the custom type for the window object
declare global {
  interface Window {
    scene: Phaser.Scene;
  }
}

export class MainScene extends Phaser.Scene {
  public agents: Agent[] = [];

  // for displaying agents on screen
  private cameraScrollSpeed = 8;
  private keyW: Phaser.Input.Keyboard.Key | null = null;
  private keyA: Phaser.Input.Keyboard.Key | null = null;
  private keyS: Phaser.Input.Keyboard.Key | null = null;
  private keyD: Phaser.Input.Keyboard.Key | null = null;
  private characters: AgentCharacter[] = [];

  constructor(agents: Agent[]) {
    super({ key: "MainScene" });
    this.agents = agents;
    window.scene = this; // attach the scene to the global window object
  }

  preload() {
    this.load.image("background", "./images/background.png");

    // for all agents, load their character spritesheets
    agentsData.forEach((agent) => {
      // load spritesheet
      this.load.spritesheet(agent.id, agent.sprite, {
        frameWidth: 16,
        frameHeight: 32,
      });
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

    this.playBackgroundMusic();
    this.setupZoom();
    this.setupKeyboard();

    // populate plans for all agents
    this.agents.forEach((agent, index) => {
      agent.createPlan(true);
      // fill basic observations
      agent.observe(`background: ${agent.personality.background}`);
      agent.observe(`current Goal: ${agent.personality.currentGoal}`);
      agent.observe(
        `agent has following innate tendencies: ${agent.personality.innateTendency.join(
          ", "
        )}`
      );
      agent.observe(
        `agent has following learned tendencies: ${agent.personality.learnedTendency.join(
          ", "
        )}`
      );
      agent.observe(
        `agent has following values: ${agent.personality.values.join(", ")}`
      );

      const startLocation = locations.find(
        (location) => location.name === agent.location
      );
      this.addCharacter(
        agent,
        agentsData[index].sprite,
        startLocation?.x ?? 0,
        startLocation?.y ?? 0
      );
    });
  }

  update() {
    this.cameraMovement();
    this.characters.forEach((character) => character.update());
  }

  updateEmoji(emoji: string) {
    console.log("Emoji changed to: ", emoji);
  }

  addCharacter(agent: Agent, sprite: string, x: number, y: number) {
    const newCharacter = new AgentCharacter(this, agent, sprite, x, y);
    newCharacter.setScale(2);
    this.characters.push(newCharacter);
  }

  private playBackgroundMusic() {
    const bgm = this.sound.add("bgm", {
      loop: true,
    });
    bgm.play();
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
          0.4,
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
