# use-stepper — Headless React Hook for Multi-Step Wizards

[![npm version](https://img.shields.io/npm/v/use-stepper.svg)](https://www.npmjs.com/package/use-stepper)
[![npm downloads](https://img.shields.io/npm/dm/use-stepper.svg)](https://www.npmjs.com/package/use-stepper)
[![CI](https://github.com/ofershap/use-stepper/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/use-stepper/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/use-stepper)](https://bundlephobia.com/package/use-stepper)

A headless React hook for type-safe multi-step wizard navigation — no wrapper components, no providers, just a hook. Zero dependencies.

```tsx
const { current, next, back, progress } = useStepper({
  steps: ["account", "profile", "review"] as const,
});
// current is "account" | "profile" | "review" — not number
```

> Tiny, headless, zero dependencies. Works with any UI library.

![use-stepper demo — multi-step form wizard with progress bar and type-safe navigation](assets/demo.gif)

## Why

|                          | use-stepper                       | react-use-wizard         | Custom `useState` |
| ------------------------ | --------------------------------- | ------------------------ | ----------------- |
| **Pure hook**            | Yes — no providers, no components | No — requires `<Wizard>` | Yes               |
| **Type-safe step names** | Yes — `as const` literal types    | No — index-based         | Manual            |
| **Linear mode**          | Built-in                          | No                       | Manual            |
| **Progress tracking**    | Built-in (0→1)                    | No                       | Manual            |
| **Dependencies**         | 0 (peer: react)                   | 0 (peer: react)          | —                 |

## Install

```bash
npm install use-stepper
```

## Quick Start

```tsx
import { useStepper } from "use-stepper";

const STEPS = ["account", "profile", "review"] as const;

function SignupWizard() {
  const { current, isFirst, isLast, next, back, progress } = useStepper({
    steps: STEPS,
    onComplete: () => console.log("Done!"),
  });

  return (
    <div>
      <progress value={progress} />
      {current === "account" && <AccountForm />}
      {current === "profile" && <ProfileForm />}
      {current === "review" && <ReviewStep />}
      <button onClick={back} disabled={isFirst}>
        Back
      </button>
      <button onClick={next}>{isLast ? "Submit" : "Next"}</button>
    </div>
  );
}
```

## API

### `useStepper(options)`

```ts
const stepper = useStepper({
  steps: ["a", "b", "c"] as const, // required — step names
  initial: "b", // optional — start step (default: first)
  linear: true, // optional — restrict goTo() to visited steps
  onComplete: () => {}, // optional — called when next() on last step
});
```

### Returns

| Property   | Type             | Description                                  |
| ---------- | ---------------- | -------------------------------------------- |
| `current`  | `Steps[number]`  | Current step name                            |
| `index`    | `number`         | Current step index (0-based)                 |
| `steps`    | `Steps`          | The steps array you passed in                |
| `isFirst`  | `boolean`        | Whether current step is the first            |
| `isLast`   | `boolean`        | Whether current step is the last             |
| `progress` | `number`         | Progress from `0` to `1`                     |
| `next()`   | `() => void`     | Go to next step (calls `onComplete` if last) |
| `back()`   | `() => void`     | Go to previous step (no-op if first)         |
| `goTo()`   | `(step) => void` | Jump to a named step                         |
| `reset()`  | `() => void`     | Reset to initial step                        |

### Linear Mode

When `linear: true`, `goTo()` only allows jumping to steps you've already visited (or the next unvisited step). `next()` and `back()` are unaffected.

```tsx
const stepper = useStepper({
  steps: ["shipping", "payment", "confirm"] as const,
  linear: true,
});

stepper.goTo("confirm"); // blocked — haven't visited "payment" yet
stepper.next(); // → "payment"
stepper.goTo("confirm"); // now allowed
```

## Patterns

### Conditional Steps

```tsx
const steps = showOptional
  ? (["info", "optional", "done"] as const)
  : (["info", "done"] as const);

const stepper = useStepper({ steps });
```

### With React Hook Form

```tsx
const stepper = useStepper({
  steps: ["details", "address", "confirm"] as const,
});

async function handleNext() {
  const valid = await trigger(); // validate current form section
  if (valid) stepper.next();
}
```

### Step Indicator

```tsx
{
  stepper.steps.map((step, i) => (
    <button
      key={step}
      onClick={() => stepper.goTo(step)}
      aria-current={step === stepper.current ? "step" : undefined}
    >
      {i + 1}. {step}
    </button>
  ));
}
```

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
