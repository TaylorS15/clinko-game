import { useRef, useEffect } from 'react';

export default function useBuildingInterval(
  intervalTick: number,
  buildingCount: number,
  buildingCps: number,
): number {
  const intervalTickRef = useRef(intervalTick);

  const intervalRate = buildingCount
    ? 1000 / (buildingCount * buildingCps)
    : 1000000000;

  useEffect(() => {
    intervalTickRef.current = intervalTick;
  }, [intervalTick]);

  useEffect(() => {
    const interval = setInterval(() => {
      return intervalTickRef.current++;
    }, intervalRate);

    return () => {
      clearInterval(interval);
    };
  }, [intervalRate]);

  return intervalTickRef.current;
}
