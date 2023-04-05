import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';
import Canvas from './Canvas';

export default function Counter() {
  const [localState, setLocalState] = useState({
    localClinks: 0,
    localCps: 0,
    localCursors: 0,
    localRows: 9,
    setClinks: (clinks: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        clinks,
      }));
    },
    setCPS: (cps: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        cps,
      }));
    },
    setCursors: (cursors: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        cursors,
      }));
    },
    setRows: (rows: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        rows,
      }));
    },
  });
  const { localClinks, localCps, localCursors, localRows } = localState;

  const { data: user_data } = api.user.getUserData.useQuery();
  const updateUserData = api.user.updateUserData.useMutation();
  const [hasLoaded, setHasLoaded] = useState(false);

  const localStateRef = useRef(localState);

  useEffect(() => {
    localStateRef.current = localState;
  });

  useEffect(() => {
    if (!hasLoaded) {
      if (user_data) {
        setLocalState((prevState) => ({
          ...prevState,
          localClinks: user_data.stored_clinks,
          localCps: user_data.clinks_per_second,
          localCursors: user_data.cursors,
          localRows: user_data.rows,
        }));
        setHasLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_data]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      updateUserData.mutate({
        clinks: Math.round(localStateRef.current.localClinks),
        cps: localStateRef.current.localCps,
        cursors: localStateRef.current.localCursors,
        rows: localStateRef.current.localRows,
      });
    }, 30000);

    const autoIncrementInterval = setInterval(() => {
      setLocalState((prevState) => ({
        ...prevState,
        localClinks:
          localStateRef.current.localClinks +
          localStateRef.current.localCps / 20,
      }));
    }, 50);

    return () => {
      clearInterval(autoSaveInterval);
      clearInterval(autoIncrementInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-12 flex flex-col gap-4">
      <Canvas rows={localRows} />

      {/* <div>
        <p className="text-2xl text-seasalt">
          StoredClinks: {user_data?.stored_clinks ?? 0}
        </p>
        <p className="text-2xl text-seasalt">
          StoredCPS: {user_data?.clinks_per_second ?? 0}
        </p>
        <p className="text-2xl text-seasalt">
          StoredCursors: {user_data?.cursors ?? 0}
        </p>
        <p className="text-2xl text-seasalt">
          StoredRows: {user_data?.rows ?? 0}
        </p>
        <p className="text-2xl text-green-500">
          localClinks: {Math.round(localClinks)}
        </p>
        <p className="text-2xl text-green-500">LocalCPS: {localCps}</p>
        <p className="text-2xl text-green-500">LocalCursors: {localCursors}</p>
        <p className="text-2xl text-green-500">LocalRows: {localRows}</p>
      </div> */}

      {/* <button
        className="w-48 ml-8 rounded-lg bg-green-500 p-2"
        onClick={() => {
          setLocalState((prevState) => ({
            ...prevState,
            localClinks: prevState.localClinks + 1,
          }));
        }}
      >
        +1 Clink
      </button>

      <button
        className="w-48 ml-8 rounded-lg bg-purple-500 p-2"
        onClick={() => {
          if (localClinks >= 10) {
            setLocalState((prevState) => ({
              ...prevState,
              localClinks: prevState.localClinks - 10,
              localCursors: prevState.localCursors + 1,
              localCps: prevState.localCps + 1,
            }));
          }
        }}
      >
        +1 Cursor(1 CPS) <br></br> (Cost: 10 Clink)
      </button> */}

      <button
        className="ml-8 w-48 rounded-lg bg-yellow-500 p-2"
        onClick={() => {
          setLocalState((prevState) => ({
            ...prevState,
            localRows: prevState.localRows + 1,
          }));
        }}
      >
        +1 Row
      </button>
      <button
        className="ml-8 w-48 rounded-lg bg-yellow-500 p-2"
        onClick={() => {
          setLocalState((prevState) => ({
            ...prevState,
            localRows: prevState.localRows - 1,
          }));
        }}
      >
        -1 Row
      </button>

      <button
        className="ml-8 w-48 rounded-lg bg-green-500 p-2"
        onClick={() => {
          updateUserData.mutate({
            clinks: Math.round(localStateRef.current.localClinks),
            cps: localStateRef.current.localCps,
            cursors: localStateRef.current.localCursors,
            rows: localStateRef.current.localRows,
          });
        }}
      >
        Save
      </button>

      <button
        className="ml-8 w-48 rounded-lg bg-red-500 p-2"
        onClick={() => {
          setLocalState((prevState) => ({
            ...prevState,
            localClinks: 0,
            localCps: 0,
            localCursors: 0,
            localRows: 8,
          }));
        }}
      >
        Reset
      </button>
    </div>
  );
}
