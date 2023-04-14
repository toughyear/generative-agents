import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const PhaserGame = (props: any) => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      backgroundColor: "#FEEFC4",
      parent: gameRef.current,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      style: "margin: auto",
    };

    const game = new Phaser.Game(config);

    function preload() {
      // Add your preload logic here
    }

    function create() {
      // Add your create logic here
      const text = game.scene.scenes[0].add.text(100, 100, "Hello, world!");
      text.setFont("VT323").setFontSize(40).setFill("#000");
    }

    function update() {
      // Add your update logic here
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} className='flex justify-center'></div>;
};

export default PhaserGame;
