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
import useBuildingInterval from '~/hooks/useBuildingInterval';
import type { GameState } from '~/types/types';

export default function Canvas({ gameState }: { gameState: GameState }) {
  const gameStateRef = useRef(gameState);

  const [bucketCollisions, setBucketCollisions] = useState<number[]>(
    new Array(gameStateRef.current.rows + 1).fill(0),
  );

  const [cursorIntervalTick] = useState<number>(0);
  const [factoryIntervalTick] = useState<number>(0);
  const [mineIntervalTick] = useState<number>(0);
  const [farmIntervalTick] = useState<number>(0);
  const [nuclearPlantIntervalTick] = useState<number>(0);
  const [cryptoMinerIntervalTick] = useState<number>(0);
  const [ballPitIntervalTick] = useState<number>(0);
  const cursorInterval = useBuildingInterval(
    cursorIntervalTick,
    gameStateRef.current.buildings.cursors.count,
    buildings.cursors.cps,
  );
  const factoryInterval = useBuildingInterval(
    factoryIntervalTick,
    gameStateRef.current.buildings.factories.count,
    buildings.factories.cps,
  );
  const farmInterval = useBuildingInterval(
    farmIntervalTick,
    gameStateRef.current.buildings.farms.count,
    buildings.farms.cps,
  );
  const mineInterval = useBuildingInterval(
    mineIntervalTick,
    gameStateRef.current.buildings.mines.count,
    buildings.mines.cps,
  );
  const nuclearPlantInterval = useBuildingInterval(
    nuclearPlantIntervalTick,
    gameStateRef.current.buildings.nuclearplants.count,
    buildings.nuclearplants.cps,
  );
  const cryptoMinerInterval = useBuildingInterval(
    cryptoMinerIntervalTick,
    gameStateRef.current.buildings.cryptominers.count,
    buildings.cryptominers.cps,
  );
  const ballPitInterval = useBuildingInterval(
    ballPitIntervalTick,
    gameStateRef.current.buildings.ballpits.count,
    buildings.ballpits.cps,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorIntervalTickRef = useRef<number>(cursorIntervalTick);
  const factoryIntervalTickRef = useRef<number>(factoryIntervalTick);
  const farmIntervalTickRef = useRef<number>(farmIntervalTick);
  const mineIntervalTickRef = useRef<number>(mineIntervalTick);
  const nuclearPlantIntervalTickRef = useRef<number>(nuclearPlantIntervalTick);
  const cryptoMinerIntervalTickRef = useRef<number>(cryptoMinerIntervalTick);
  const ballPitIntervalTickRef = useRef<number>(ballPitIntervalTick);
  const bucketCollisionsRef = useRef<number[]>(bucketCollisions);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    bucketCollisionsRef.current = bucketCollisions;
  }, [bucketCollisions]);

  useEffect(() => {
    cursorIntervalTickRef.current = cursorInterval;
  }, [cursorInterval]);
  useEffect(() => {
    factoryIntervalTickRef.current = factoryInterval;
  }, [factoryInterval]);
  useEffect(() => {
    farmIntervalTickRef.current = farmInterval;
  }, [farmInterval]);
  useEffect(() => {
    mineIntervalTickRef.current = mineInterval;
  }, [mineInterval]);
  useEffect(() => {
    nuclearPlantIntervalTickRef.current = nuclearPlantInterval;
  }, [nuclearPlantInterval]);
  useEffect(() => {
    cryptoMinerIntervalTickRef.current = cryptoMinerInterval;
  }, [cryptoMinerInterval]);
  useEffect(() => {
    ballPitIntervalTickRef.current = ballPitInterval;
  }, [ballPitInterval]);

  useEffect(() => {
    const updateClinksInterval = setInterval(() => {
      gameStateRef.current.setClinks(
        gameStateRef.current.clinks +
          bucketCollisionsRef.current.reduce((a, b) => a + b, 0),
      );
      setBucketCollisions(new Array(gameStateRef.current.rows + 1).fill(0));
    }, 100);

    return () => {
      clearInterval(updateClinksInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    const gameWidth = 449;

    const pinRadius = gameWidth / (10 * gameStateRef.current.rows + 28);
    const ballRadius = pinRadius * 3.5;
    const ySpacingC = (10 * pinRadius) ** 2;
    const ySpacingB = (5 * pinRadius) ** 2;
    const ySpacingA = Math.sqrt(ySpacingC - ySpacingB); //Vertical spacing between balls

    const restitution = 0.5;
    const friction = 0.0;
    const minXBallSpawn = gameWidth / 2 - pinRadius * 9;
    const maxXBallSpawn = gameWidth / 2 + pinRadius * 9;
    const minYBallSpawn =
      gameWidth - 25 - ySpacingA * (gameStateRef.current.rows - 1);
    const maxYBallSpawn =
      gameWidth -
      25 -
      ySpacingA * (gameStateRef.current.rows - 1) -
      ballRadius * 5;

    const getRandomInt = (min: number, max: number): number => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const random = Math.floor(Math.random() * (max - min + 1)) + min;

      return random;
    };

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

    const pins: Matter.Body[] = [];
    let startingCoord: [number, number] = [9 * pinRadius, gameWidth - 25];
    let tempCoord = startingCoord;
    for (let i = gameStateRef.current.rows; i > 0; i--) {
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

    const buckets: Matter.Body[] = [];
    const numOfBuckets = gameStateRef.current.rows + 1;
    const bucketWidth = 10 * pinRadius;
    for (let i = 0; i < numOfBuckets; i++) {
      const bucket = Bodies.rectangle(
        bucketWidth / 2 + (i + 1) * bucketWidth - pinRadius,
        gameWidth,
        bucketWidth - 1,
        30,
        {
          isStatic: true,
          render: { fillStyle: '#1E1E1E' },
          slop: 0,
          label: 'Bucket',
        },
      );
      buckets.push(bucket);
    }

    const leftSideBucket = Bodies.rectangle(
      -126 + bucketWidth,
      gameWidth,
      250,
      20,
      {
        isStatic: true,
        render: { fillStyle: '#1E1E1E' },
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
        render: { fillStyle: '#1E1E1E' },
        slop: 0,
        label: 'Side Bucket',
      },
    );

    const pyramidWallLeft = Bodies.rectangle(
      pinRadius * 6 + pinRadius * 10 * (gameStateRef.current.rows / 4),
      gameWidth - 35 - ySpacingA * (gameStateRef.current.rows / 2),
      3,
      Math.sqrt(ySpacingC) * gameStateRef.current.rows - 25,
      {
        isStatic: true,
        render: { fillStyle: '#1E1E1E' },
        slop: 0,
      },
    );
    const pyramidWallRight = Bodies.rectangle(
      gameWidth -
        pinRadius * 6 -
        pinRadius * 10 * (gameStateRef.current.rows / 4),
      gameWidth - 35 - ySpacingA * (gameStateRef.current.rows / 2),
      3,
      Math.sqrt(ySpacingC) * gameStateRef.current.rows - 25,
      {
        isStatic: true,
        render: { fillStyle: '#1E1E1E' },
        slop: 0,
      },
    );
    Body.rotate(pyramidWallLeft, 0.525);
    Body.rotate(pyramidWallRight, -0.525);

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
                  gameStateRef.current.buildings[
                    //@ts-expect-error added custom building property to Body
                    ball.building as keyof typeof gameStateRef.current.buildings
                  ].level;

                newState[index] +=
                  ballValue *
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  buildings.rows.bucketMultiplier[gameStateRef.current.rows][
                    index
                  ];

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

    canvas?.addEventListener('click', () => {
      const ball = Bodies.circle(
        getRandomInt(minXBallSpawn, maxXBallSpawn),
        getRandomInt(minYBallSpawn, maxYBallSpawn),
        ballRadius,
        {
          render: {
            fillStyle:
              upgradeLevelColors[
                gameStateRef.current.buildings.cursors
                  .level as keyof typeof upgradeLevelColors
              ],
          },
          restitution: restitution,
          friction: friction,
          slop: 0,
          label: 'Ball',
          //@ts-expect-error added custom building property to Body
          building: 'cursors',
          collisionFilter: {
            group: -1,
          },
        },
      );

      Composite.add(world, ball);
    });

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
                  gameStateRef.current.buildings.cursors
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'cursors',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.cursors.level
        ) {
          // gameStateRef.current.clinks -=
          //   gameStateRef.current.buildings.cursors.level;
          Composite.add(world, ball);
          lastCursorTick = cursorIntervalTickRef.current;
        }
      }
    }, 1);

    let lastFactoryTick = 0;
    const factoryTicker = setInterval(() => {
      if (lastFactoryTick !== factoryIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  gameStateRef.current.buildings.factories
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'factories',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.factories.level
        ) {
          // gameStateRef.current.clinks -=
          //   gameStateRef.current.buildings.factories.level;
          Composite.add(world, ball);
          lastFactoryTick = factoryIntervalTickRef.current;
        }
      }
    }, 1);

    let lastMineTick = 0;
    const mineTicker = setInterval(() => {
      if (lastMineTick !== mineIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  gameStateRef.current.buildings.mines
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'mines',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.mines.level
        ) {
          // gameStateRef.current.clinks -=
          // gameStateRef.current.buildings.mines.level;
          Composite.add(world, ball);
          lastMineTick = mineIntervalTickRef.current;
        }
      }
    }, 1);

    let lastFarmTick = 0;
    const farmTicker = setInterval(() => {
      if (lastFarmTick !== farmIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  gameStateRef.current.buildings.farms
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'farms',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.farms.level
        ) {
          // gameStateRef.current.clinks -=
          //   gameStateRef.current.buildings.farms.level;
          Composite.add(world, ball);
          lastFarmTick = farmIntervalTickRef.current;
        }
      }
    }, 1);

    let lastNuclearPlantTick = 0;
    const nuclearPlantTicker = setInterval(() => {
      if (lastNuclearPlantTick !== nuclearPlantIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  gameStateRef.current.buildings.nuclearplants
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'nuclearplants',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.nuclearplants.level
        ) {
          // gameStateRef.current.clinks -=
          //   gameStateRef.current.buildings.nuclearplants.level;
          Composite.add(world, ball);
          lastNuclearPlantTick = nuclearPlantIntervalTickRef.current;
        }
      }
    }, 1);

    let lastCryptoMinerTick = 0;
    const cryptoMinerTicker = setInterval(() => {
      if (lastCryptoMinerTick !== cryptoMinerIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  gameStateRef.current.buildings.cryptominers
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'cryptominers',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.cryptominers.level
        ) {
          // gameStateRef.current.clinks -=
          //   gameStateRef.current.buildings.cryptominers.level;
          Composite.add(world, ball);
          lastCryptoMinerTick = cryptoMinerIntervalTickRef.current;
        }
      }
    }, 1);

    let lastBallPitTick = 0;
    const ballPitTicker = setInterval(() => {
      if (lastBallPitTick !== ballPitIntervalTickRef.current) {
        const ball = Bodies.circle(
          getRandomInt(minXBallSpawn, maxXBallSpawn),
          getRandomInt(minYBallSpawn, maxYBallSpawn),
          ballRadius,
          {
            render: {
              fillStyle:
                upgradeLevelColors[
                  gameStateRef.current.buildings.ballpits
                    .level as keyof typeof upgradeLevelColors
                ],
            },
            restitution: restitution,
            friction: friction,
            label: 'Ball',
            //@ts-expect-error added custom building property to Body
            building: 'ballpits',
            slop: 0,
            collisionFilter: {
              group: -1,
            },
          },
        );

        if (
          gameStateRef.current.clinks >=
          gameStateRef.current.buildings.ballpits.level
        ) {
          // gameStateRef.current.clinks -=
          //   gameStateRef.current.buildings.ballpits.level;
          Composite.add(world, ball);
          lastBallPitTick = ballPitIntervalTickRef.current;
        }
      }
    }, 1);

    setBucketCollisions(new Array(gameStateRef.current.rows + 1).fill(0));

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
      clearInterval(factoryTicker);
      clearInterval(farmTicker);
      clearInterval(nuclearPlantTicker);
      clearInterval(cryptoMinerTicker);
      clearInterval(ballPitTicker);
      clearInterval(mineTicker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.rows]);

  return (
    <div className="">
      <canvas className="max-w-[449px] cursor-pointer" ref={canvasRef} />
      <div className="relative h-1 w-full max-w-[449px] bg-[#1E1E1E]">
        {bucketCollisions.map((bucket, index) => {
          return (
            <div
              key={index}
              className="absolute bg-orange-500"
              style={{
                top: '-15px',
                width: `${449 / (gameState.rows + 3) - 3}px`,
                height: `15px`,
                left: `${
                  449 / (gameState.rows + 3) +
                  (index * 449) / (gameState.rows + 3) +
                  (index > bucketCollisions.length / 2 ? 1.5 : 1.5)
                }px`,
              }}
            >
              <p
                className={`absolute inset-0 text-center text-xs text-seasalt`}
              >
                {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  buildings.rows.bucketMultiplier[gameState.rows][index]
                }
                x
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
