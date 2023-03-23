import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  updateUserData: protectedProcedure
    .input(
      z.object({ cursors: z.number(), clinks: z.number(), cps: z.number() }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          stored_clinks: input.clinks,
          clinks_per_second: input.cps,
          cursors: input.cursors,
        },
      });
    }),
});
