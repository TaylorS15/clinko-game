import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';
import Canvas from './Canvas';
import { getBuildingCost } from '~/components/upgrade';

export default function Game() {
  const [localState, setLocalState] = useState({
    clinks: 15000,
    cursors: 0,
    rows: 8,
    buildingLevels: {
      cursor: 1,
    },
    setClinks: (clinks: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        clinks: clinks,
      }));
    },
    setCursors: (cursors: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        cursors: cursors,
      }));
    },
    setRows: (rows: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        rows: rows,
      }));
    },
    setCursorLevel: (cursorLevel: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        buildingLevels: {
          ...prevState.buildingLevels,
          cursor: cursorLevel,
        },
      }));
    },
  });
  const {
    clinks,
    cursors,
    rows,
    buildingLevels,
    setClinks,
    setCursors,
    setRows,
    setCursorLevel,
  } = localState;

  const { data: game_data } = api.game.getGameData.useQuery();
  const { data: upgrade_data } = api.game.getUpgradeData.useQuery();
  const updateGameData = api.game.updateGameData.useMutation();
  const updateUpgradeData = api.game.updateUpgradeData.useMutation();
  const [hasGameDataLoaded, setHasGameDataLoaded] = useState(false);
  const [hasUpgradeDataLoaded, setHasUpgradeDataLoaded] = useState(false);

  /**
   * When passing state to the useEffect increment below we need a ref to get the updated state value since the hook is only ran on mount.
   * We set localStateRef.current to localState
   */
  const localStateRef = useRef(localState);
  useEffect(() => {
    localStateRef.current = localState;
  });

  useEffect(() => {
    if (!hasGameDataLoaded) {
      if (game_data) {
        setClinks(game_data.clinks);
        setCursors(game_data.cursors);
        setRows(game_data.rows);
        setHasGameDataLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game_data]);
  useEffect(() => {
    if (!hasUpgradeDataLoaded) {
      if (upgrade_data) {
        setCursorLevel(upgrade_data.cursorLevel);
        setHasUpgradeDataLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgrade_data]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      updateGameData.mutate({
        clinks: Math.round(localStateRef.current.clinks),
        cursors: localStateRef.current.cursors,
        rows: localStateRef.current.rows,
      });
      updateUpgradeData.mutate({
        cursorLevel: localStateRef.current.buildingLevels.cursor,
      });
    }, 300000);

    return () => {
      clearInterval(autoSaveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-12 mb-24 flex flex-col gap-2">
      <Canvas localState={localState} />

      <div>
        <p className="text-2xl font-bold text-seasalt">
          Clinks: {Math.round(clinks).toLocaleString('en-US')}
        </p>
        <p className="text-2xl font-bold text-seasalt">Cursors: {cursors}</p>
        <p className="text-2xl font-bold text-seasalt">Rows: {rows}</p>
        <p className="text-2xl font-bold text-seasalt">
          Cursor Level: {buildingLevels.cursor}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          className="w-48 rounded-lg bg-purple-500 p-2"
          onClick={() => {
            const cost = getBuildingCost('cursor', cursors);
            if (cost <= clinks) {
              setClinks(clinks - cost);
              setCursors(cursors + 1);
            }
          }}
        >
          +1 Cursor <br></br> Cost:{' '}
          {getBuildingCost('cursor', cursors).toLocaleString('en-US')} Clinks
        </button>
        <button
          className="w-48 rounded-lg bg-purple-500 p-2"
          onClick={() => {
            const cost = getBuildingCost(
              'buildingUpgrade',
              buildingLevels.cursor,
            );
            if (cost <= clinks) {
              setClinks(clinks - cost);
              setCursorLevel(buildingLevels.cursor + 1);
            }
          }}
        >
          Upgrade Cursors <br></br> Cost:{' '}
          {getBuildingCost(
            'buildingUpgrade',
            buildingLevels.cursor,
          ).toLocaleString('en-US')}{' '}
          Clinks
        </button>
      </div>

      <button
        className="w-48 rounded-lg bg-yellow-500 p-2"
        onClick={() => {
          const cost = getBuildingCost('row', rows - 8);
          if (rows < 19 && cost <= clinks) {
            setClinks(clinks - cost);
            setRows(rows + 1);
          }
        }}
      >
        +1 Row <br></br> Cost: {rows === 19 && 'Maxed Out!'}
        {rows !== 19 &&
          getBuildingCost('row', rows - 8).toLocaleString('en-US') +
            ' Clinks'}{' '}
      </button>

      <button
        className="w-48 rounded-lg bg-yellow-500 p-2"
        onClick={() => {
          if (rows > 8) {
            setRows(rows - 1);
          }
        }}
      >
        -1 Row
      </button>

      <button
        className="w-48 rounded-lg bg-green-500 p-2"
        onClick={() => {
          updateGameData.mutate({
            clinks: Math.round(clinks),
            cursors: cursors,
            rows: rows,
          });
          updateUpgradeData.mutate({
            cursorLevel: buildingLevels.cursor,
          });
        }}
      >
        Save
      </button>

      <button
        className="w-48 rounded-lg bg-red-500 p-2"
        onClick={() => {
          setClinks(0);
          setCursors(0);
          setRows(8);
          setCursorLevel(1);
        }}
      >
        Reset
      </button>
    </div>
  );
}
