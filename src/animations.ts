export interface Animated {
  isAnimating: boolean;
  tick: (deltaTime: number) => void;
  onFinish?: () => void;
}

const ANIMATION_SLOW_COEF = 1; // how much times to slow animation

const runningAnimations = new Set<Animated>();

// safe to call multiple times with the same animation, since it's te Set
export const addAnimation = (val: Animated) => {
  if (runningAnimations.size === 0) requestAnimationFrame(tick);

  runningAnimations.add(val);
};

let lastTime = 0;
const tick = (currentTime: number) => {
  const deltaTime = lastTime ? currentTime - lastTime : 1000 / 60;

  lastTime = currentTime;

  const animationsToRemove: Animated[] = [];
  for (const anim of runningAnimations) {
    anim.tick(deltaTime / ANIMATION_SLOW_COEF);
    if (!anim.isAnimating) animationsToRemove.push(anim);
  }

  if (animationsToRemove.length > 0) {
    animationsToRemove.forEach((anim) => {
      if (anim.onFinish) anim.onFinish();
      runningAnimations.delete(anim);
    });
  }

  if (runningAnimations.size !== 0) requestAnimationFrame(tick);
  else {
    console.log("All animations stopped");
    lastTime = 0;
  }

  onTick();
};

let onTick: () => void;

export const setOnTick = (cb: () => void) => {
  onTick = cb;
};

//
//
//
//
//

export type Spring = {
  lastValue: number;
  currentValue: number;
  targetValue: number;
} & Animated;

export const spring = (v: number) => {
  const anim: Spring = {
    currentValue: v,
    isAnimating: false,
    lastValue: v,
    targetValue: v,
    tick: springTick,
  };
  return anim;
};

export const to = (anim: Spring, val: number) => {
  anim.isAnimating = true;
  anim.targetValue = val;
  addAnimation(anim);
};

export const fromTo = (anim: Spring, from: number, val: number) => {
  anim.currentValue = from;
  anim.lastValue = from;
  to(anim, val);
};

const precision = 0.1;

const stiffness = 0.02;
const damping = 2.5;
const invertedMass = 0.28;

function springTick(this: Spring, deltaTime: number) {
  const { currentValue, targetValue, lastValue } = this;
  const delta = targetValue - currentValue;
  const velocity = (currentValue - lastValue) / deltaTime;
  const spring = stiffness * delta;
  const damper = damping * velocity;
  const acceleration = (spring - damper) * invertedMass;
  const d = (velocity + acceleration) * deltaTime;

  if (Math.abs(d) < precision && Math.abs(delta) < precision) {
    this.isAnimating = false;
    this.currentValue = targetValue;
  } else {
    this.lastValue = this.currentValue;
    this.currentValue += d;
  }
}

// Some implementations of spring animations at open source

// React-Spring
// https://github.com/pmndrs/react-spring/blob/master/packages/core/src/SpringValue.ts

// Svelte
// https://github.com/sveltejs/svelte/blob/master/src/runtime/motion/spring.ts#L12
