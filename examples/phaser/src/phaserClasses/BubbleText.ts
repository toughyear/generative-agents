import Phaser from "phaser";

class BubbleText extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private textObject: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y);
    scene.add.existing(this);

    this.textObject = new Phaser.GameObjects.Text(scene, 5, 5, text, {
      fontSize: "18px",
      color: "#000",
      backgroundColor: "#FFF",
      padding: { left: 5, right: 5, top: 2, bottom: 2 },
    });
    this.background = new Phaser.GameObjects.Graphics(scene);
    this.add(this.background);
    this.add(this.textObject);
    this.updateBackground();
  }

  updateText(text: string) {
    this.textObject.setText(text);
    this.updateBackground();
  }

  private updateBackground() {
    this.background.clear();
    this.background.fillStyle(0xffffff);
    this.background.fillRoundedRect(
      0,
      0,
      this.textObject.width + 10,
      this.textObject.height + 10,
      5
    );
  }
}

export default BubbleText;
