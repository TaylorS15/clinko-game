import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';

export const gameRouter = createTRPCRouter({
  getGameData: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.gameData.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  getUpgradeData: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.upgradeData.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  updateGameData: protectedProcedure
    .input(
      z.object({
        clinks: z.number().min(0),
        cursors: z.number().min(0),
        mines: z.number().min(0),
        factories: z.number().min(0),
        nuclearplants: z.number().min(0),
        farms: z.number().min(0),
        cryptominers: z.number().min(0),
        ballpits: z.number().min(0),
        rows: z.number().min(8).max(19),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.gameData.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          clinks: input.clinks,
          cursors: input.cursors,
          factories: input.factories,
          mines: input.mines,
          nuclearplants: input.nuclearplants,
          farms: input.farms,
          cryptominers: input.cryptominers,
          ballpits: input.ballpits,
          rows: input.rows,
        },
      });
    }),

  updateUpgradeData: protectedProcedure
    .input(
      z.object({
        cursorLevel: z.number().min(1).max(25),
        factoryLevel: z.number().min(1).max(25),
        farmLevel: z.number().min(1).max(25),
        mineLevel: z.number().min(1).max(25),
        nuclearplantLevel: z.number().min(1).max(25),
        cryptominerLevel: z.number().min(1).max(25),
        ballpitLevel: z.number().min(1).max(25),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.upgradeData.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          cursorLevel: input.cursorLevel,
          factoryLevel: input.factoryLevel,
          farmLevel: input.farmLevel,
          mineLevel: input.mineLevel,
          nuclearplantLevel: input.nuclearplantLevel,
          cryptominerLevel: input.cryptominerLevel,
          ballpitLevel: input.ballpitLevel,
        },
      });
    }),
});
