import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';

export default function Counter() {
  const [localState, setLocalState] = useState({
    localClinks: 0,
    localCps: 0,
    localCursors: 0,
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
  });
  const { localClinks, localCps, localCursors } = localState;

  const { data: user_data } = api.user.getUserData.useQuery();
  const updateUserData = api.user.updateUserData.useMutation();

  const localStateRef = useRef(localState);

  useEffect(() => {
    localStateRef.current = localState;
  });

  useEffect(() => {
    if (user_data) {
      setLocalState((prevState) => ({
        ...prevState,
        localClinks: user_data.stored_clinks,
        localCps: user_data.clinks_per_second,
        localCursors: user_data.cursors,
      }));
    }
  }, [user_data]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      updateUserData.mutate({
        clinks: Math.round(localStateRef.current.localClinks),
        cps: localStateRef.current.localCps,
        cursors: localStateRef.current.localCursors,
      });
    }, 5000);

    const autoIncrementInterval = setInterval(() => {
      console.log('increment');
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
  }, []);

  return (
    <div className="mt-12 flex flex-col gap-4">
      <div>
        <p className="text-2xl text-seasalt">
          StoredClinks: {user_data?.stored_clinks ?? 0}
        </p>
        <p className="text-2xl text-seasalt">
          StoredCPS: {user_data?.clinks_per_second ?? 0}
        </p>
        <p className="text-2xl text-seasalt">
          StoredCursors: {user_data?.cursors ?? 0}
        </p>
        <p className="text-2xl text-green-500">
          localClinks: {Math.round(localClinks)}
        </p>
        <p className="text-2xl text-green-500">LocalCPS: {localCps}</p>
        <p className="text-2xl text-green-500">LocalCursors: {localCursors}</p>
      </div>

      <button
        className="rounded-lg bg-green-500 p-2"
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
        className="rounded-lg bg-purple-500 p-2"
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
      </button>

      <button
        className="rounded-lg bg-red-500 p-2"
        onClick={() => {
          setLocalState((prevState) => ({
            ...prevState,
            localClinks: 0,
            localCps: 0,
            localCursors: 0,
          }));
        }}
      >
        Reset
      </button>
    </div>
  );
}
