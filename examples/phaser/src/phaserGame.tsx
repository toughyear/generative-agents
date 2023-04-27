import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import { Agent } from "generative-agents";

interface Props {
  agents: Agent[];
}

const PhaserGame: React.FC<Props> = (props) => {
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
      scene: [new MainScene(props.agents)],
      pixelArt: true,
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      phaserGameRef.current?.destroy(true);
    };
  }, []);

  return <div ref={gameRef} className='flex justify-center mt-10'></div>;
};

export default PhaserGame;
