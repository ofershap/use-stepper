import { useCallback, useMemo, useState } from "react";

export interface StepperOptions<Steps extends readonly string[]> {
  steps: Steps;
  initial?: Steps[number];
  linear?: boolean;
  onComplete?: () => void;
}

export interface StepperState<Steps extends readonly string[]> {
  current: Steps[number];
  index: number;
  steps: Steps;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
  next: () => void;
  back: () => void;
  goTo: (step: Steps[number]) => void;
  reset: () => void;
}

export function useStepper<const Steps extends readonly string[]>(
  options: StepperOptions<Steps>,
): StepperState<Steps> {
  const { steps, initial, linear = false, onComplete } = options;
  if (steps.length === 0) {
    throw new Error("useStepper: steps array must not be empty");
  }
  const initialIndex = initial ? steps.indexOf(initial) : 0;
  const [index, setIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [furthest, setFurthest] = useState(
    initialIndex === -1 ? 0 : initialIndex,
  );

  const next = useCallback(() => {
    setIndex((prev) => {
      if (prev >= steps.length - 1) {
        onComplete?.();
        return prev;
      }
      const nextIdx = prev + 1;
      setFurthest((f) => Math.max(f, nextIdx));
      return nextIdx;
    });
  }, [steps.length, onComplete]);

  const back = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goTo = useCallback(
    (step: Steps[number]) => {
      const target = steps.indexOf(step);
      if (target === -1) return;
      if (linear && target > furthest + 1) return;
      setIndex(target);
      setFurthest((f) => Math.max(f, target));
    },
    [steps, linear, furthest],
  );

  const reset = useCallback(() => {
    const resetIdx = initialIndex === -1 ? 0 : initialIndex;
    setIndex(resetIdx);
    setFurthest(resetIdx);
  }, [initialIndex]);

  return useMemo(
    () => ({
      current: steps[index] as Steps[number],
      index,
      steps,
      isFirst: index === 0,
      isLast: index === steps.length - 1,
      progress: steps.length <= 1 ? 1 : index / (steps.length - 1),
      next,
      back,
      goTo,
      reset,
    }),
    [index, steps, next, back, goTo, reset],
  );
}
