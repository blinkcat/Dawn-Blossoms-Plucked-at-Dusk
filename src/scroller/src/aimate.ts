export type AnimationId = Animate['counter'];

export type StepCallback = (percent: number, now: number, virtual: boolean) => any;

export type VerifyCallback = (id: number) => boolean;

export type CompletedCallback = (
  renderedFramesPerSecond: number,
  id: Animate['counter'],
  finishedAnimation: boolean
) => void;

export type EasingMethod = (k: number) => number;

interface AnimateIdDb {
  [index: number]: true | null;
}

export class Animate {
  time = Date.now;
  running: AnimateIdDb = {};
  counter = 1;
  private readonly desiredFrame = 60;
  private readonly millisecondsPerSecond = 1000;

  requestAnimationFrame(callback: AnyFunction) {
    // ie10+, android 4.4+
    window.requestAnimationFrame(callback);
  }

  stop(id: AnimationId) {
    // meaningful
    const cleared = this.running[id] != null;
    if (cleared) {
      this.running[id] = null;
    }
    return cleared;
  }

  isRunning(id: AnimationId) {
    return this.running[id] != null;
  }

  start(
    stepCallback: StepCallback,
    verifyCallback: VerifyCallback | null,
    completedCallback: CompletedCallback | null,
    duration?: number,
    easingMethod?: EasingMethod
  ): AnimationId {
    const start = this.time();
    let lastFrameTime = start;
    let percent = 0;
    let drapCounter = 0;
    const id = this.counter++;

    // compacting
    if (id % 20 === 0) {
      for (const id in this.running) {
        if (this.running[id] !== true) {
          delete this.running[id];
        }
      }
    }

    const step = (virtual: boolean) => {
      const render = virtual !== true;
      const now = this.time();

      // check before next animation step
      if (!this.isRunning(id) || (verifyCallback && !verifyCallback(id))) {
        this.running[id] = null;
        completedCallback &&
          completedCallback(this.desiredFrame - drapCounter / ((now - start) / this.millisecondsPerSecond), id, false);
        return;
      }

      if (render) {
        const droppedFrames = Math.round((now - lastFrameTime) / (this.millisecondsPerSecond / this.desiredFrame)) - 1;
        for (let i = 0; i < Math.min(droppedFrames, 4); i++) {
          step(true);
          drapCounter++;
        }
      }

      if (duration) {
        percent = (now - start) / duration;
        percent = percent > 1 ? 1 : percent;
      }

      const value = easingMethod ? easingMethod(percent) : percent;
      if ((stepCallback(value, now, render) === false || percent === 1) && render) {
        this.running[id] = null;
        completedCallback &&
          completedCallback(
            this.desiredFrame - drapCounter / ((now - start) / this.millisecondsPerSecond),
            id,
            percent === 1 || duration == null
          );
      } else if (render) {
        lastFrameTime = now;
        this.requestAnimationFrame(step);
      }
    };

    this.running[id] = true;
    this.requestAnimationFrame(step);
    return id;
  }
}

const animate = new Animate();
// tslint:disable-next-line
export default animate;
