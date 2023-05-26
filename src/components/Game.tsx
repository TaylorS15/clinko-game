import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';
import Canvas from './Canvas';
import UpgradeCard from './BuildingCard';
import { type GameState, type Building, type RowCount } from '~/types/types';
import { getBuildingCost } from './upgrade';
import Image from 'next/image';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    clinks: 0,
    rows: 8,
    buildings: {
      cursors: {
        count: 0,
        level: 1,
      },
      factories: {
        count: 0,
        level: 1,
      },
    },
    setClinks: (clinks: number) => {
      setGameState((prevState) => ({
        ...prevState,
        clinks: clinks,
      }));
    },
    setRows: (rows: RowCount) => {
      setGameState((prevState) => ({
        ...prevState,
        rows: rows,
      }));
    },
    setBuildingCount: (building: Building['name'], count: number) => {
      setGameState((prevState) => ({
        ...prevState,
        buildings: {
          ...prevState.buildings,
          [building]: {
            ...prevState.buildings[building],
            count: count,
            level: prevState.buildings[building].level,
          },
        },
      }));
    },
    setBuildingLevel: (building: Building['name'], level: number) => {
      setGameState((prevState) => ({
        ...prevState,
        buildings: {
          ...prevState.buildings,
          [building]: {
            ...prevState.buildings[building],
            count: prevState.buildings[building].count,
            level: level,
          },
        },
      }));
    },
  });
  const {
    clinks,
    rows,
    setClinks,
    setRows,
    setBuildingCount,
    setBuildingLevel,
  } = gameState;
  const { cursors, factories } = gameState.buildings;

  const { data: game_data } = api.game.getGameData.useQuery();
  const { data: upgrade_data } = api.game.getUpgradeData.useQuery();
  const updateGameData = api.game.updateGameData.useMutation();
  const updateUpgradeData = api.game.updateUpgradeData.useMutation();
  const [hasGameDataLoaded, setHasGameDataLoaded] = useState(false);
  const [hasUpgradeDataLoaded, setHasUpgradeDataLoaded] = useState(false);

  /**
   * When passing state to the useEffect increment below we need a ref to get the updated state value since the hook is only ran on mount.
   * We set gameStateRef.current to gameState
   */
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!hasGameDataLoaded) {
      if (game_data) {
        setClinks(game_data.clinks);
        setRows(game_data.rows as RowCount);
        setBuildingCount('cursors', game_data.cursors);
        setBuildingCount('factories', game_data.factories);
        setHasGameDataLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game_data]);
  useEffect(() => {
    if (!hasUpgradeDataLoaded) {
      if (upgrade_data) {
        setBuildingLevel('cursors', upgrade_data.cursorLevel);
        setBuildingLevel('factories', upgrade_data.factoryLevel);
        setHasUpgradeDataLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgrade_data]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      updateGameData.mutate({
        clinks: Math.round(gameStateRef.current.clinks),
        cursors: gameStateRef.current.buildings.cursors.count,
        factories: gameStateRef.current.buildings.factories.count,
        rows: gameStateRef.current.rows,
      });
      updateUpgradeData.mutate({
        cursorLevel: gameStateRef.current.buildings.cursors.level,
        factoryLevel: gameStateRef.current.buildings.factories.level,
      });
    }, 300000);

    return () => {
      clearInterval(autoSaveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-12 mb-24 flex flex-col gap-4">
      <Canvas gameState={gameState} />

      <p className="text-2xl font-bold text-seasalt">
        Clinks: {Math.round(clinks).toLocaleString('en-US')}
      </p>

      <UpgradeCard upgrade={'cursors'} gameState={gameState} />
      <UpgradeCard upgrade={'factories'} gameState={gameState} />

      <div
        className="flex h-20 w-96 cursor-pointer justify-between rounded-t-md border-4 border-ultra-violet bg-space-cadet p-2 hover:bg-slate-700"
        onClick={() => {
          const cost = getBuildingCost('rows', rows - 8);

          console.log(cost, gameState.clinks);
          if (gameState.clinks >= cost) {
            gameState.setClinks(gameState.clinks - cost);
            gameState.setRows((rows + 1) as RowCount);
          }
        }}
      >
        <div className="flex w-2/3 gap-2">
          <Image
            src={`/assets/Rows.webp`}
            width={64}
            height={64}
            alt="Rows"
            className="my-auto h-min w-1/6"
          />
          <div className="flex flex-col justify-center">
            <p className="text-xl font-bold text-seasalt">
              Cost: {getBuildingCost('rows', rows - 8).toLocaleString('en-US')}
            </p>
            <p className="text-xl font-bold text-seasalt">+1 Row</p>
          </div>
        </div>

        <div className="text-end">
          <p className="text-xl font-bold text-seasalt">Level: {rows - 7}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="w-48 rounded-lg bg-green-500 p-2"
          onClick={() => {
            updateGameData.mutate({
              clinks: Math.round(clinks),
              cursors: cursors.count,
              factories: factories.count,
              rows: rows,
            });
            updateUpgradeData.mutate({
              cursorLevel: gameState.buildings.cursors.level,
              factoryLevel: gameState.buildings.factories.level,
            });
          }}
        >
          Save
        </button>

        <button
          className="w-48 rounded-lg bg-red-500 p-2"
          onClick={() => {
            setClinks(0);
            setRows(8);
            setBuildingCount('cursors', 0);
            setBuildingLevel('cursors', 1);
            setBuildingCount('factories', 0);
            setBuildingLevel('factories', 1);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
