import {
  Engine,
  Bodies,
  Render,
  Runner,
  Composite,
  Events,
  type IEventCollision,
  Body,
} from 'matter-js';
import { useEffect, useRef, useState } from 'react';

export default function Canvas({
  rows,
  localStateRef,
}: {
  rows: number;
  localStateRef: React.MutableRefObject<{
    localClinks: number;
    localCursors: number;
    localRows: number;
    setClinks: (clinks: number) => void;
    setCursors: (cursors: number) => void;
    setRows: (rows: number) => void;
  }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bucketCollisions, setBucketCollisions] = useState<number[]>(
    new Array(rows + 1).fill(0),
  );
  const [debugMode, setDebugMode] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    /**
     * 449px game width was chosen since it can appear on the smallest screens and have a center pixel
     */
    const gameWidth = 449;

    /**
     * Constants for pin and ball values.
     * ySpacingA is the vertical spacing between pins.
     */
    const pinRadius = gameWidth / (10 * rows + 28);
    const ballRadius = pinRadius * 3.5;
    const ySpacingC = (10 * pinRadius) ** 2;
    const ySpacingB = (5 * pinRadius) ** 2;
    const ySpacingA = Math.sqrt(ySpacingC - ySpacingB);

    /**
     * Constants for restitution and friction.
     * min and max values are used to spawn balls randomly within a certain area above the top three pins.
     */
    const restitution = 0.5;
    const friction = 0.0;
    const minXBallSpawn = gameWidth / 2 - pinRadius * 9;
    const maxXBallSpawn = gameWidth / 2 + pinRadius * 9;
    const minYBallSpawn = gameWidth - 25 - ySpacingA * (rows - 1);
    const maxYBallSpawn =
      gameWidth - 25 - ySpacingA * (rows - 1) - ballRadius * 5;

    /**
     * Function to get a random integer between min and max
     * Discards middle of top pins to stop balls from getting stuck
     */
    const getRandomInt = (min: number, max: number): number => {
      min = Math.ceil(min);
      max = Math.floor(max);
      let random = Math.floor(Math.random() * (max - min + 1)) + min;

      if (
        random === gameWidth / 2 ||
        random === gameWidth / 2 + 1 ||
        random === gameWidth / 2 - 1 ||
        random === gameWidth / 2 - pinRadius * 7 ||
        random === gameWidth / 2 + pinRadius * 7 ||
        random === gameWidth / 2 - pinRadius * 7 + 1 ||
        random === gameWidth / 2 + pinRadius * 7 + 1
      ) {
        random = getRandomInt(min, max);
      }

      return random;
    };

    /**
     * Creating the engine, world, render, and runner
     */
    const engine = Engine.create({
      gravity: { x: 0, y: 1 },
    });
    const world = engine.world;
    const render = Render.create({
      canvas: canvas as HTMLCanvasElement,
      engine,
      options: {
        width: gameWidth,
        height: gameWidth,
        wireframes: false,
        background: '#1E1E1E',
      },
    });
    const runner = Runner.create();

    /**
     * Arrays to hold dynamic number of bodies in the world
     */
    const pins: Matter.Body[] = [];
    const buckets: Matter.Body[] = [];

    /**
     * Pin creation loops
     * Spacing values are based on a 3 pinRadius spacing between pins
     */
    let startingCoord: [number, number] = [9 * pinRadius, gameWidth - 25];
    let tempCoord = startingCoord;
    for (let i = rows; i > 0; i--) {
      tempCoord = [startingCoord[0], startingCoord[1]];

      for (let j = 0; j <= i + 1; j++) {
        const pin = Bodies.circle(tempCoord[0], tempCoord[1], pinRadius, {
          render: { fillStyle: '#CE6A85' },
          restitution: restitution,
          isStatic: true,
          friction: friction,
          slop: 0,
        });

        pins.push(pin);
        tempCoord[0] = tempCoord[0] + 10 * pinRadius;
      }

      startingCoord = [
        startingCoord[0] + 5 * pinRadius,
        startingCoord[1] - ySpacingA,
      ];
    }

    /*
     * Bucket Creation
     * Number of buckets is always rows + 1
     * For loop creates the buckets and pushes them to the floors array
     */
    const numOfBuckets = rows + 1;
    const bucketWidth = 10 * pinRadius;
    for (let i = 0; i < numOfBuckets; i++) {
      const bucket = Bodies.rectangle(
        bucketWidth / 2 + (i + 1) * bucketWidth - pinRadius,
        gameWidth,
        bucketWidth - 1,
        20,
        {
          isStatic: true,
          render: { fillStyle: '#13bf11' },
          slop: 0,
          label: 'Bucket',
        },
      );

      buckets.push(bucket);
    }

    /**
     * Left and right side buckets that extend out past the game window and do not increment bucketCollisions
     */
    const leftSideBucket = Bodies.rectangle(
      -126 + bucketWidth,
      gameWidth,
      250,
      20,
      {
        isStatic: true,
        render: { fillStyle: '#eb2323' },
        slop: 0,
        label: 'Side bucket',
      },
    );
    const rightSideBucket = Bodies.rectangle(
      gameWidth + 126 - bucketWidth,
      gameWidth,
      250,
      20,
      {
        isStatic: true,
        render: { fillStyle: '#eb2323' },
        slop: 0,
        label: 'Side bucket',
      },
    );

    /**
     * Pyramid walls
     */
    const pyramidWallLeft = Bodies.rectangle(
      pinRadius * 6 + pinRadius * 10 * (rows / 4),
      gameWidth - 35 - ySpacingA * (rows / 2),
      3,
      Math.sqrt(ySpacingC) * rows - 25,
      {
        isStatic: true,
        render: { fillStyle: '#48E5C2' },
        slop: 0,
      },
    );
    const pyramidWallRight = Bodies.rectangle(
      gameWidth - pinRadius * 6 - pinRadius * 10 * (rows / 4),
      gameWidth - 35 - ySpacingA * (rows / 2),
      3,
      Math.sqrt(ySpacingC) * rows - 25,
      {
        isStatic: true,
        render: { fillStyle: '#48E5C2' },
        slop: 0,
      },
    );
    Body.rotate(pyramidWallLeft, 0.52);
    Body.rotate(pyramidWallRight, -0.52);

    /**
     * Debug sensor lines
     */
    const debugCenterLine = Bodies.rectangle(
      gameWidth / 2,
      gameWidth / 2,
      3,
      gameWidth,
      {
        isStatic: true,
        render: { fillStyle: '#13bf11' },
        isSensor: true,
      },
    );
    const debugTopLine = Bodies.rectangle(
      gameWidth / 2,
      gameWidth - 25 - ySpacingA * (rows - 1),
      gameWidth,
      3,
      {
        isStatic: true,
        render: { fillStyle: '#13bf11' },
        isSensor: true,
      },
    );
    const debugLeftBallSpawn = Bodies.rectangle(
      minXBallSpawn,
      minYBallSpawn - ballRadius,
      3,
      maxYBallSpawn - minYBallSpawn,
      {
        isStatic: true,
        render: { fillStyle: '#13bf11' },
        isSensor: true,
      },
    );
    const debugRightBallSpawn = Bodies.rectangle(
      maxXBallSpawn,
      minYBallSpawn - ballRadius,
      3,
      maxYBallSpawn - minYBallSpawn,
      {
        isStatic: true,
        render: { fillStyle: '#13bf11' },
        isSensor: true,
      },
    );

    /**
     * Create collision handlers for each bucket
     * On collision: remove the ball and update correct floorCollisions index
     * Side buckets are handled separately and dont update floorCollisions
     * @todo: Add score multipliers for each bucket based on index
     */
    function handleCollision(event: IEventCollision<Engine>): void {
      event.pairs.forEach((pair) => {
        const labels = [pair.bodyA.label, pair.bodyB.label];

        if (labels.includes('Ball') && labels.includes('Bucket')) {
          const ball = pair.bodyA.label === 'Ball' ? pair.bodyA : pair.bodyB;
          const bucket =
            pair.bodyA.label === 'Bucket' ? pair.bodyA : pair.bodyB;

          Composite.remove(world, ball);
          buckets.map((_bucket, index) => {
            if (_bucket.id === bucket.id) {
              setBucketCollisions((prevState) => {
                const newState = [...prevState];
                newState[index] += 1;
                return newState;
              });
            }
          });
          localStateRef.current.setClinks(
            localStateRef.current.localClinks + 1,
          );
        }

        if (labels.includes('Ball') && labels.includes('Side bucket')) {
          const ball = pair.bodyA.label === 'Ball' ? pair.bodyA : pair.bodyB;

          Composite.remove(world, ball);
        }
      });
    }

    /**
     * Add a new ball on click
     */
    canvas?.addEventListener('click', () => {
      const ball = Bodies.circle(
        getRandomInt(minXBallSpawn, maxXBallSpawn),
        getRandomInt(minYBallSpawn, maxYBallSpawn),
        ballRadius,
        {
          render: { fillStyle: '#FF8C61' },
          restitution: restitution,
          friction: friction,
          slop: 0,
          label: 'Ball',
          collisionFilter: {
            group: -1,
          },
        },
      );

      Composite.add(world, ball);
    });

    /**
     * Add all bodies to the world and run the engine
     */
    Render.run(render);
    debugMode
      ? Composite.add(world, [
          ...buckets,
          ...pins,
          leftSideBucket,
          rightSideBucket,
          pyramidWallLeft,
          pyramidWallRight,
          debugCenterLine,
          debugTopLine,
          debugLeftBallSpawn,
          debugRightBallSpawn,
        ])
      : Composite.add(world, [
          ...buckets,
          ...pins,
          leftSideBucket,
          rightSideBucket,
          pyramidWallLeft,
          pyramidWallRight,
        ]);
    Events.on(engine, 'collisionActive', handleCollision);
    Runner.run(runner, engine);

    /**
     * Fill bucketCollisions array with 0s on mount
     */
    setBucketCollisions(new Array(rows + 1).fill(0));

    /**
     * Automatically adds new balls to game
     * @param {number} interval - interval in milliseconds
     */
    const interval = setInterval(() => {
      const ball = Bodies.circle(
        getRandomInt(minXBallSpawn, maxXBallSpawn),
        getRandomInt(minYBallSpawn, maxYBallSpawn),
        ballRadius,
        {
          render: { fillStyle: '#FF8C61' },
          restitution: restitution,
          friction: friction,
          label: 'Ball',
          slop: 0,
          collisionFilter: {
            group: -1,
          },
        },
      );

      Composite.add(world, ball);
    }, 1);

    /**
     * Cleanup when component unmounts to stop duplication of game
     */
    return () => {
      Render.stop(render);
      debugMode
        ? Composite.remove(world, [
            ...buckets,
            ...pins,
            leftSideBucket,
            rightSideBucket,
            pyramidWallLeft,
            pyramidWallRight,
            debugCenterLine,
            debugTopLine,
            debugLeftBallSpawn,
            debugRightBallSpawn,
          ])
        : Composite.remove(world, [
            ...buckets,
            ...pins,
            leftSideBucket,
            rightSideBucket,
            pyramidWallLeft,
            pyramidWallRight,
          ]);
      Events.off(engine, 'collisionActive', handleCollision);
      Runner.stop(runner);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, debugMode]);

  return (
    <>
      <button
        className={`${
          debugMode ? 'bg-green-700' : 'bg-red-700'
        } h-10 w-24 rounded-lg text-xl font-bold text-white`}
        onClick={() => setDebugMode(!debugMode)}
      >
        Debug
      </button>
      <div>
        <p className="flex text-lg font-bold text-orange-500">
          Collisions: {bucketCollisions.reduce((a, b) => a + b, 0)}
        </p>

        <p className="text-lg font-bold text-red-500">Rows: {rows}</p>

        <div className="flex">
          {bucketCollisions.map((bucketCollision, index) => (
            <p key={index} className="text-xs font-bold text-green-500">
              {(
                (bucketCollision /
                  bucketCollisions.reduce((a, b) => a + b, 0)) *
                100
              ).toFixed(2)}
              %<span className="font-normal text-seasalt">,</span>
            </p>
          ))}
        </div>
      </div>
      <canvas className="max-w-[449px]" ref={canvasRef} />
    </>
  );
}

/**
 * Bucket %'s per number of rows
 * Values are from outside bucket to middle bucket
 * Bucket pairs are merged into one value because they often have slightly different %'s and can be averaged together when scoring
 * Rows: 8 - [11.6, 13.28, 26.35, 34.5, 17.25]
 * Rows: 12 - [1.54, 4.79, 7.96, 14.79, 23.95, 30.55, 16.59]
 * Rows: 19 - [15.52, 13.45, 20.64, 22.21]
 */
