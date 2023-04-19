import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";

interface Props {
  emoji: string;
}

const PhaserGame: React.FC<Props> = ({ emoji }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800 * 1.5,
      height: 480 * 1.5,
      backgroundColor: "#FEEFC4",
      parent: gameRef.current,
      scene: [MainScene],
      pixelArt: true,
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      phaserGameRef.current?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (!phaserGameRef.current) return;
    const game = phaserGameRef.current;

    const scene = game.scene.getScene("MainScene") as MainScene;
    scene?.updateEmoji(emoji);
  }, [emoji]);

  return <div ref={gameRef} className='flex justify-center mt-10'></div>;
};

export default PhaserGame;
