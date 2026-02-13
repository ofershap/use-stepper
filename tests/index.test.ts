import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStepper } from "../src/index.js";

const STEPS = ["account", "profile", "review", "confirm"] as const;

describe("useStepper", () => {
  it("starts at the first step by default", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.current).toBe("account");
    expect(result.current.index).toBe(0);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
  });

  it("starts at the specified initial step", () => {
    const { result } = renderHook(() =>
      useStepper({ steps: STEPS, initial: "review" }),
    );
    expect(result.current.current).toBe("review");
    expect(result.current.index).toBe(2);
  });

  it("falls back to first step if initial is invalid", () => {
    const { result } = renderHook(() =>
      useStepper({
        steps: STEPS,
        initial: "nonexistent" as (typeof STEPS)[number],
      }),
    );
    expect(result.current.current).toBe("account");
    expect(result.current.index).toBe(0);
  });

  it("navigates forward with next()", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.next());
    expect(result.current.current).toBe("profile");
    expect(result.current.index).toBe(1);
  });

  it("navigates backward with back()", () => {
    const { result } = renderHook(() =>
      useStepper({ steps: STEPS, initial: "review" }),
    );
    act(() => result.current.back());
    expect(result.current.current).toBe("profile");
    expect(result.current.index).toBe(1);
  });

  it("does not go below index 0 with back()", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.back());
    expect(result.current.current).toBe("account");
    expect(result.current.index).toBe(0);
  });

  it("does not go past the last step with next()", () => {
    const { result } = renderHook(() =>
      useStepper({ steps: STEPS, initial: "confirm" }),
    );
    act(() => result.current.next());
    expect(result.current.current).toBe("confirm");
    expect(result.current.index).toBe(3);
  });

  it("calls onComplete when next() is called on the last step", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useStepper({ steps: STEPS, initial: "confirm", onComplete }),
    );
    act(() => result.current.next());
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does not call onComplete when not on the last step", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useStepper({ steps: STEPS, onComplete }),
    );
    act(() => result.current.next());
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("navigates to a specific step with goTo()", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.goTo("review"));
    expect(result.current.current).toBe("review");
    expect(result.current.index).toBe(2);
  });

  it("ignores goTo() with an invalid step name", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.goTo("nonexistent" as (typeof STEPS)[number]));
    expect(result.current.current).toBe("account");
  });

  it("resets to the initial step", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.reset());
    expect(result.current.current).toBe("account");
    expect(result.current.index).toBe(0);
  });

  it("resets to the custom initial step", () => {
    const { result } = renderHook(() =>
      useStepper({ steps: STEPS, initial: "profile" }),
    );
    act(() => result.current.next());
    act(() => result.current.reset());
    expect(result.current.current).toBe("profile");
    expect(result.current.index).toBe(1);
  });

  it("reports isFirst and isLast correctly", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);

    act(() => result.current.goTo("confirm"));
    expect(result.current.isFirst).toBe(false);
    expect(result.current.isLast).toBe(true);
  });

  it("calculates progress correctly", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.progress).toBe(0);

    act(() => result.current.next());
    expect(result.current.progress).toBeCloseTo(1 / 3);

    act(() => result.current.next());
    expect(result.current.progress).toBeCloseTo(2 / 3);

    act(() => result.current.next());
    expect(result.current.progress).toBe(1);
  });

  it("returns progress of 1 for a single-step stepper", () => {
    const { result } = renderHook(() =>
      useStepper({ steps: ["only"] as const }),
    );
    expect(result.current.progress).toBe(1);
  });

  it("exposes the steps array", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.steps).toBe(STEPS);
  });

  describe("linear mode", () => {
    it("allows goTo() to visited steps", () => {
      const { result } = renderHook(() =>
        useStepper({ steps: STEPS, linear: true }),
      );
      act(() => result.current.next());
      act(() => result.current.next());
      act(() => result.current.goTo("account"));
      expect(result.current.current).toBe("account");
    });

    it("allows goTo() to the next unvisited step", () => {
      const { result } = renderHook(() =>
        useStepper({ steps: STEPS, linear: true }),
      );
      act(() => result.current.next());
      act(() => result.current.goTo("review"));
      expect(result.current.current).toBe("review");
    });

    it("blocks goTo() to steps beyond the next unvisited", () => {
      const { result } = renderHook(() =>
        useStepper({ steps: STEPS, linear: true }),
      );
      act(() => result.current.goTo("confirm"));
      expect(result.current.current).toBe("account");
      expect(result.current.index).toBe(0);
    });

    it("does not restrict next()/back() navigation", () => {
      const { result } = renderHook(() =>
        useStepper({ steps: STEPS, linear: true }),
      );
      act(() => result.current.next());
      act(() => result.current.next());
      act(() => result.current.back());
      expect(result.current.current).toBe("profile");
    });
  });

  it("handles rapid next/back toggling", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => {
      result.current.next();
      result.current.next();
      result.current.back();
      result.current.next();
    });
    expect(result.current.current).toBe("review");
  });
});
