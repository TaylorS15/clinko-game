import { createTRPCRouter } from '~/server/api/trpc';
import { userRouter } from '~/server/api/routers/user';
import { gameRouter } from '~/server/api/routers/game';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  game: gameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
