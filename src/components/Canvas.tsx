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
import { buildings, upgradeLevelColors } from '~/components/upgrade';

export default function Canvas({
  localState,
}: {
  localState: {
    clinks: number;
    cursors: number;
    rows: number;
    buildingLevels: {
      cursor: number;
    };
    setClinks: (clinks: number) => void;
    setCursors: (cursors: number) => void;
    setRows: (rows: number) => void;
    setCursorLevel: (cursorLevel: number) => void;
  };
}) {
  const localStateRef = useRef(localState);

  const [bucketCollisions, setBucketCollisions] = useState<number[]>(
    new Array(localStateRef.current.rows + 1).fill(0),
  );
  const [cursorIntervalTick, setCursorIntervalTick] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorIntervalTickRef = useRef<number>(cursorIntervalTick);
  const bucketCollisionsRef = useRef<number[]>(bucketCollisions);

  /**
   * Keep localStateRef.current up to date with localState
   */
  useEffect(() => {
    localStateRef.current = localState;
  });

  /**
   * To update clinks without missing collisions we need to use a local state variable instead of effecting the parent state directly
   * updateClinksInterval is used to update parent localClinks with the bucket collisions made between intervals
   * After the update we set bucketCollision back to 0
   */
  useEffect(() => {
    bucketCollisionsRef.current = bucketCollisions;
  });
  useEffect(() => {
    const updateClinksInterval = setInterval(() => {
      localStateRef.current.setClinks(
        localStateRef.current.clinks +
          bucketCollisionsRef.current.reduce((a, b) => a + b, 0),
      );
      setBucketCollisions(new Array(localStateRef.current.rows + 1).fill(0));
    }, 10);

    return () => {
      clearInterval(updateClinksInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Calculating how often to spawn a ball based on cursorLevel and number of cursors.
   */
  useEffect(() => {
    cursorIntervalTickRef.current = cursorIntervalTick;
  });
  const cursorIntervalRate = localStateRef.current.cursors
    ? 1000 /
      (localStateRef.current.cursors *
        (buildings.cursor.cps * localStateRef.current.buildingLevels.cursor))
    : 1000000000;
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorIntervalTick((prev) => prev + 1);
    }, cursorIntervalRate);

    return () => {
      clearInterval(cursorInterval);
    };
  }, [cursorIntervalRate]);

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
    const pinRadius = gameWidth / (10 * localStateRef.current.rows + 28);
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
    const minYBallSpawn =
      gameWidth - 25 - ySpacingA * (localStateRef.current.rows - 1);
    const maxYBallSpawn =
      gameWidth -
      25 -
      ySpacingA * (localStateRef.current.rows - 1) -
      ballRadius * 5;

    /**
     * Function to get a random integer between min and max
     */
    const getRandomInt = (min: number, max: number): number => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const random = Math.floor(Math.random() * (max - min + 1)) + min;

      return random;
    };

    /**
     * Creating the engine, world, render, and runner
     */
    const engine = Engine.create({
      gravity: { x: 0, y: 1.1 },
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
    for (let i = localStateRef.current.rows; i > 0; i--) {
      tempCoord = [startingCoord[0], startingCoord[1]];

      for (let j = 0; j <= i + 1; j++) {
        const pin = Bodies.circle(tempCoord[0], tempCoord[1], pinRadius, {
          render: { fillStyle: '#FCFAF9' },
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
    const numOfBuckets = localStateRef.current.rows + 1;
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
        label: 'Side Bucket',
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
        label: 'Side Bucket',
      },
    );

    /**
     * Pyramid walls
     * Only change the (rows / x) values to edit placement
     */
    const pyramidWallLeft = Bodies.rectangle(
      pinRadius * 6 + pinRadius * 10 * (localStateRef.current.rows / 4),
      gameWidth - 35 - ySpacingA * (localStateRef.current.rows / 2),
      3,
      Math.sqrt(ySpacingC) * localStateRef.current.rows - 25,
      {
        isStatic: true,
        render: { fillStyle: '#1E1E1E' },
        slop: 0,
      },
    );
    const pyramidWallRight = Bodies.rectangle(
      gameWidth -
        pinRadius * 6 -
        pinRadius * 10 * (localStateRef.current.rows / 4),
      gameWidth - 35 - ySpacingA * (localStateRef.current.rows / 2),
      3,
      Math.sqrt(ySpacingC) * localStateRef.current.rows - 25,
      {
        isStatic: true,
        render: { fillStyle: '#1E1E1E' },
        slop: 0,
      },
    );
    Body.rotate(pyramidWallLeft, 0.525);
    Body.rotate(pyramidWallRight, -0.525);

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
          const bucket = pair.bodyA.label.includes('Bucket')
            ? pair.bodyA
            : pair.bodyB;

          Composite.remove(world, ball);
          buckets.map((_bucket, index) => {
            if (_bucket.id === bucket.id) {
              setBucketCollisions((prevState) => {
                const newState = [...prevState];
                const ballValue =
                  localStateRef.current.buildingLevels[
                    //@ts-expect-error added custom building property to Body
                    ball.building as keyof typeof localStateRef.current.buildingLevels
                  ];
                newState[index] += ballValue;
                return newState;
              });
            }
          });
        }

        if (labels.includes('Ball') && labels.includes('Side Bucket')) {
          const ball = pair.bodyA.label === 'Ball' ? pair.bodyA : pair.bodyB;

          Composite.remove(world, ball);
        }
      });
    }

    /**
     * Add a new ball on click
     * Subtract clink cost from localClinks ref.
     */
    canvas?.addEventListener('click', () => {
      const ball = Bodies.circle(
        getRandomInt(minXBallSpawn, maxXBallSpawn),
        getRandomInt(minYBallSpawn, maxYBallSpawn),
        ballRadius,
        {
          render: {
            fillStyle:
              upgradeLevelColors[
                localStateRef.current.buildingLevels
                  .cursor as keyof typeof upgradeLevelColors
              ],
          },
          restitution: restitution,
          friction: friction,
          slop: 0,
          label: 'Ball',
          //@ts-expect-error added custom building property to Body
          building: 'cursor',
          collisionFilter: {
            group: -1,
          },
        },
      );

      Composite.add(world, ball);
    });

    /**
     * Checks if cursorIntervalTick has changed since last local tick.
     * If so, add a new ball to the world and increment lastCursorTick to stop adding balls until next cursorIntervalTick.
     * Subtract clink cost from localClinks ref.
     */
    let lastCursorTick = 0;
    const cursorTicker = setInterval(() => {
      if (lastCursorTick !== cursorIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  localStateRef.current.buildingLevels
                    .cursor as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'cursor',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        Composite.add(world, ball);
        localStateRef.current.clinks -=
          localStateRef.current.buildingLevels.cursor;
        lastCursorTick = cursorIntervalTickRef.current;
      }
    }, 0);

    /**
     * Fill bucketCollisions array with 0s on mount
     */
    setBucketCollisions(new Array(localStateRef.current.rows + 1).fill(0));

    /**
     * Add all bodies to the world and run the engine
     */
    Render.run(render);
    Composite.add(world, [
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
     * Cleanup when component unmounts to stop duplication of game
     */
    return () => {
      Render.stop(render);
      //@ts-expect-error index.d.ts file is missing ability to pass array to Composite.remove
      Composite.remove(world, [
        ...buckets,
        ...pins,
        leftSideBucket,
        rightSideBucket,
        pyramidWallLeft,
        pyramidWallRight,
      ]);
      Events.off(engine, 'collisionActive', handleCollision);
      Runner.stop(runner);
      clearInterval(cursorTicker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localState.rows]);

  return (
    <>
      <div>
        <p className="flex text-lg font-bold text-orange-500">
          Collisions: {bucketCollisions.reduce((a, b) => a + b, 0)}
        </p>
        <p className="text-lg font-bold text-red-500">
          Rows: {localStateRef.current.rows}
        </p>
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
 * rows: 8 - [7.5, 16.3, 25.3, 32.3, 18.7] - 26.67, 12.27, 7.9, 6.20, 5.34
 * rows: 12 - [1.54, 4.79, 7.96, 14.79, 23.95, 30.55, 16.59]
 * rows: 19 - [15.52, 13.45, 20.64, 22.21]
 */
