import Image from 'next/image';
import { getBuildingCost } from './upgrade';
import type { Building, GameState } from '~/types/types';

export default function BuildingCard({
  upgrade,
  gameState,
}: {
  upgrade: string;
  gameState: GameState;
}) {
  const nonPluralBuildings = {
    cursors: 'Cursor',
    factories: 'Factory',
    farms: 'Farm',
    mines: 'Mine',
    nuclearplants: 'Nuclear Plant',
    cryptominers: 'Crypto Miner',
    ballpits: 'Ball Pit',
  };

  return (
    <div>
      <div
        className="flex h-20 w-96 cursor-pointer justify-between rounded-t-md border-4 border-ultra-violet bg-space-cadet p-2 hover:bg-slate-700"
        onClick={() => {
          const cost = getBuildingCost(
            upgrade,
            gameState.buildings[upgrade as Building['name']].count,
          );

          if (gameState.clinks >= cost) {
            gameState.setClinks(gameState.clinks - cost);
            gameState.setBuildingCount(
              upgrade as Building['name'],
              gameState.buildings[upgrade as Building['name']].count + 1,
            );
          }
        }}
      >
        <div className="flex w-2/3 gap-2">
          <Image
            src={`/assets/${
              nonPluralBuildings[upgrade as Building['name']]
            }.webp`}
            width={64}
            height={64}
            alt="Cursor"
            className="my-auto h-min w-1/6"
          />
          <div className="flex flex-col justify-center">
            <p className="text-xl font-bold text-seasalt">
              Cost:{' '}
              {getBuildingCost(
                upgrade,
                gameState.buildings[upgrade as Building['name']].count,
              ).toLocaleString('en-US')}
            </p>
            <p className="text-xl font-bold text-seasalt">
              +1 {nonPluralBuildings[upgrade as Building['name']]}
            </p>
          </div>
        </div>

        <div className="text-end">
          <p className="text-xl font-bold text-seasalt">
            Count: {gameState.buildings[upgrade as Building['name']].count}
          </p>
          <p className="text-xl font-bold text-seasalt">
            Level: {gameState.buildings[upgrade as Building['name']].level}
          </p>
        </div>
      </div>

      <div className="flex h-12 w-96 cursor-pointer justify-between rounded-b-md border-r-4 border-b-4 border-l-4 border-ultra-violet bg-space-cadet p-2 hover:bg-slate-700">
        <p className="text-lg font-bold text-seasalt">
          Upgrade:{' '}
          {getBuildingCost(
            'buildingUpgrade',
            gameState.buildings[upgrade as Building['name']].level,
          ).toLocaleString('en-US')}
        </p>
      </div>
    </div>
  );
}
