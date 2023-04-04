import {
  Engine,
  Bodies,
  Render,
  Runner,
  Composite,
  World,
  Events,
  type IEventCollision,
} from 'matter-js';
import { useEffect, useRef, useState } from 'react';

export default function Canvas({ rows }: { rows: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bucketCollisions, setBucketCollisions] = useState<number[]>(
    new Array(rows + 3).fill(0),
  );

  useEffect(() => {
    setBucketCollisions(new Array(rows + 3).fill(0));
  }, [rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    /*
     * Calculate game width with max width of 800px
     */
    const clientWidth = document.body.clientWidth;
    const maxWidth = 800;
    const gameWidth = clientWidth < maxWidth ? clientWidth : maxWidth;

    /*
     * Ball and pin radius are 2.167% of the game width (Found through trial and error at 600px game width with rows 8)
     * Ball and pin radius are the same to result in correct distribution of balls in buckets (Possibly could change)
     */
    const ballRadius = gameWidth * 0.02167; //rows 8
    // const ballRadius = gameWidth * 0.0175; //rows 9
    const pinRadius = ballRadius;

    /*
     * Constants for ball and pin values
     * Found through trial and error
     */

    const restitution = 0.5;
    const friction = 0;
    const minXBallSpawn = gameWidth * 0.45;
    const maxXBallSpawn = gameWidth * 0.55;
    const minYBallSpawn = gameWidth * 0;
    const maxYBallSpawn = gameWidth * 0.0167;

    /*
     * Function to get a random integer between min and max
     * Discards exact middle of game width to prevent ball getting stuck
     */
    function getRandomInt(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      let random = Math.floor(Math.random() * (max - min + 1)) + min;

      if (random === gameWidth / 2) {
        random = getRandomInt(min, max);
      }

      return random;
    }

    /*
     * If canvas exists create the game using values above
     */
    if (canvas) {
      const engine = Engine.create();
      const world = engine.world;
      const render = Render.create({
        canvas,
        engine,
        options: {
          width: gameWidth,
          height: gameWidth,
          wireframes: false,
          background: '#333333',
        },
      });

      /*
       * Initial ball and wall creation
       */
      let ball = Bodies.circle(
        getRandomInt(minXBallSpawn, maxXBallSpawn),
        getRandomInt(minYBallSpawn, maxYBallSpawn),
        ballRadius,
        {
          render: { fillStyle: '#FF8C61' },
          restitution: restitution,
          label: 'ball',
          friction: friction,
        },
      );

      const wallLeft = Bodies.rectangle(0, gameWidth / 2, 5, gameWidth, {
        isStatic: true,
        render: { fillStyle: '#48E5C2' },
      });

      const wallRight = Bodies.rectangle(
        gameWidth,
        gameWidth / 2,
        5,
        gameWidth,
        {
          isStatic: true,
          render: { fillStyle: '#48E5C2' },
        },
      );

      /*
       * Pin Creation to create a pyramid with the correct number of rows starting at 3 pins
       * pinConstant was found through trial and error at 600px game width
       */
      for (let i = 2; i < rows + 2; i++) {
        for (let j = 0; j <= i; j++) {
          const pinConstant = gameWidth * 0.09167;
          // const pinConstant = gameWidth * 0.078;

          const x = gameWidth / 2 + (j - i / 2) * pinConstant;
          const y = -50 + i * pinConstant;

          const pin = Bodies.circle(x, y, pinRadius, {
            render: { fillStyle: '#CE6A85' },
            restitution: restitution,
            isStatic: true,
            friction: friction,
            slop: 0.1,
          });

          World.add(world, pin);
        }
      }

      /*
       * Bucket Creation
       * Number of buckets is always rows + 3
       * For loop creates the buckets and pushes them to the floors array
       */
      const numOfBuckets = rows + 3;
      const buckets: Matter.Body[] = [];

      for (let i = 0; i < numOfBuckets; i++) {
        const bucketWidth = gameWidth * 0.09;
        // const bucketWidth = gameWidth * 0.083;

        const bucket = Bodies.rectangle(
          bucketWidth / 2 + i * bucketWidth,
          gameWidth * 0.8,
          bucketWidth * 0.95,
          5,
          {
            isStatic: true,
            render: { fillStyle: '#48E5C2' },
          },
        );

        buckets.push(bucket);
      }

      /*
       * Create collision handlers for each bucket
       * On collision: remove the ball, update correct floorCollisions index, and add a new ball
       * @TODO: Add score multipliers for each bucket based on index
       */
      function handleCollision(event: IEventCollision<Engine>) {
        const pairs = event.pairs;

        buckets.map((bucket, index) => {
          if (
            (pairs[0]?.bodyA === bucket && pairs[0]?.bodyB === ball) ||
            (pairs[0]?.bodyA === ball && pairs[0]?.bodyB === bucket)
          ) {
            Composite.remove(world, ball);

            setBucketCollisions((prevState) => {
              const newBucketCollisions = [...prevState];
              newBucketCollisions[index] += 1;
              return newBucketCollisions;
            });

            Composite.add(world, [
              (ball = Bodies.circle(
                getRandomInt(minXBallSpawn, maxXBallSpawn),
                getRandomInt(minYBallSpawn, maxYBallSpawn),
                ballRadius,
                {
                  render: { fillStyle: '#FF8C61' },
                  restitution: restitution,
                  label: 'ball',
                  friction: friction,
                },
              )),
            ]);
          }
        });
      }

      /*
       * Add all bodies to the world and run the engine
       */
      Render.run(render);
      Composite.add(world, [ball, ...buckets, wallLeft, wallRight]);
      Events.on(engine, 'collisionActive', handleCollision);
      Runner.run(engine);
      Render.run(render);

      return () => {
        Render.stop(render);
        Events.off(engine, 'collisionActive', handleCollision);
      };
    }
  }, [rows, canvasRef]);

  return (
    <>
      <div className="ml-8 flex text-2xl font-bold text-seasalt">
        {bucketCollisions.reduce((a, b) => a + b, 0)}
        {/* {', '}
        <div className="flex gap-8">
          {activeBalls.map((ball, index) => {
            return (
              <div key={index} className="text-2xl font-bold text-seasalt">
                {ball.x} {ball.y}
              </div>
            );
          })}
        </div> */}
      </div>
      <div className="ml-4 flex">
        {bucketCollisions.map((bucketCollision, index) => (
          <div
            key={index}
            className={`${
              index === 4 || index === 5 || index === 6
                ? 'text-green-600'
                : index === 0 || index === 10
                ? 'text-red-600'
                : index === 1 ||
                  index === 2 ||
                  index === 3 ||
                  index === 7 ||
                  index === 8 ||
                  index === 9
                ? 'text-yellow-600'
                : 'text-seasalt'
            } text-2xl font-bold`}
          >
            {bucketCollision}
            <span className="font-normal text-seasalt">,</span>
          </div>
        ))}
      </div>
      <div className="relative">
        <canvas ref={canvasRef} />
      </div>
    </>
  );
}
