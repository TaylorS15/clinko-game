import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';
import Canvas from './Canvas';

export default function Counter() {
  const [localState, setLocalState] = useState({
    localClinks: 0,
    localCursors: 0,
    localRows: 8,
    setClinks: (clinks: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        localClinks: clinks,
      }));
    },
    setCursors: (cursors: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        localCursors: cursors,
      }));
    },
    setRows: (rows: number) => {
      setLocalState((prevState) => ({
        ...prevState,
        localRows: rows,
      }));
    },
  });
  const {
    localClinks,
    localCursors,
    localRows,
    setClinks,
    setCursors,
    setRows,
  } = localState;

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
        setClinks(user_data.stored_clinks);
        setCursors(user_data.cursors);
        setRows(user_data.rows);
        setHasLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_data]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      updateUserData.mutate({
        clinks: Math.round(localStateRef.current.localClinks),
        cursors: localStateRef.current.localCursors,
        rows: localStateRef.current.localRows,
      });
    }, 300000);

    return () => {
      clearInterval(autoSaveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-12 flex flex-col gap-2">
      <Canvas rows={localRows} localStateRef={localStateRef} />

      <div>
        <p className="text-2xl text-seasalt">
          StoredClinks: {user_data?.stored_clinks ?? 0}
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
        <p className="text-2xl text-green-500">LocalCursors: {localCursors}</p>
        <p className="text-2xl text-green-500">LocalRows: {localRows}</p>
      </div>

      <button
        className="ml-8 w-48 rounded-lg bg-green-500 p-2"
        onClick={() => setClinks(localClinks + 1)}
      >
        +1 Clink
      </button>

      <button
        className="ml-8 w-48 rounded-lg bg-purple-500 p-2"
        onClick={() => {
          if (localClinks >= 10) {
            setClinks(localClinks - 10);
            setCursors(localCursors + 1);
          }
        }}
      >
        +1 Cursor(1 CPS) <br></br> (Cost: 10 Clink)
      </button>

      <button
        className="ml-8 w-48 rounded-lg bg-yellow-500 p-2"
        onClick={() => {
          if (localState.localRows < 19) {
            setRows(localRows + 1);
          }
        }}
      >
        +1 Row
      </button>

      <button
        className="ml-8 w-48 rounded-lg bg-yellow-500 p-2"
        onClick={() => {
          if (localState.localRows > 8) {
            setRows(localRows - 1);
          }
        }}
      >
        -1 Row
      </button>

      <button
        className="ml-8 w-48 rounded-lg bg-green-500 p-2"
        onClick={() => {
          updateUserData.mutate({
            clinks: Math.round(localStateRef.current.localClinks),
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
          setClinks(0);
          setCursors(0);
          setRows(8);
        }}
      >
        Reset
      </button>
    </div>
  );
}
