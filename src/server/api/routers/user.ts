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
      z.object({
        cursors: z.number(),
        clinks: z.number(),
        rows: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          stored_clinks: input.clinks,
          cursors: input.cursors,
          rows: input.rows,
        },
      });
    }),
});
