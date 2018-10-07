import { Easing } from './Easing';
import { now } from './now';
import { TweenGroup } from './TweenGroup';

type EasingFunction = (k: number) => number;
type AnyFunction = (...args: any[]) => any;
interface AnyObject {
  [index: string]: any;
}

export class Tween {
  private static _id = 0;
  private id: number;
  private object: AnyObject = {};
  private valueStart: AnyObject = {};
  private valueEnd: AnyObject = {};
  private startTime!: number;
  private delayTime = 0;
  private duration!: number;
  private _isPlaying = false;
  private easingFunction: EasingFunction = Easing.Linear.None;
  private onStartCallback!: AnyFunction;
  private onStartCallbackFired!: boolean;
  private onUpdateCallback!: AnyFunction;
  private onCompleteCallback!: AnyFunction;
  private onStopCallback!: AnyFunction;
  private group: TweenGroup;

  constructor(object = {}, group: TweenGroup) {
    this.id = Tween._id++;
    this.object = object;
    this.group = group;
  }

  getId() {
    return this.id;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  set isPlaying(v: boolean) {
    this._isPlaying = v;
  }

  easing(easingFunction: EasingFunction) {
    this.easingFunction = easingFunction;
    return this;
  }

  start(time = 0) {
    this.group.add(this);
    this.startTime = now() + this.delayTime + time;
    this.isPlaying = true;
    this.onStartCallbackFired = false;
    for (const k in this.valueEnd) {
      if (this.object[k] !== undefined) {
        this.valueStart[k] = this.object[k];
      }
    }
    return this;
  }

  stop() {
    return this;
  }

  delay(time: number) {
    this.delayTime = time;
    return this;
  }

  to(destination: object, duration = 1000) {
    this.valueEnd = destination;
    this.duration = duration;
    return this;
  }

  update(time: number) {
    // console.log(`${this.id} update ${time}`);
    if (time < this.startTime) {
      return true;
    }

    if (this.onStartCallbackFired === false) {
      this.onStartCallback && this.onStartCallback(this.object);
      this.onStartCallbackFired = true;
    }

    let elapsed = (time - this.startTime) / this.duration;
    if (this.duration === 0 || elapsed > 1) {
      elapsed = 1;
    }

    const coefficient = this.easingFunction(elapsed);

    for (const k in this.valueEnd) {
      if (this.valueEnd.hasOwnProperty(k)) {
        const start = this.valueStart[k];
        if (start === undefined) {
          continue;
        }
        const end = this.valueEnd[k];
        this.object[k] = start + (end - start) * coefficient;
      }
    }

    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.object);
    }

    if (elapsed === 1) {
      if (this.onCompleteCallback) {
        this.onCompleteCallback(this.object);
      }
      return false;
    }

    return true;
  }

  onStart(callback: AnyFunction) {
    this.onStartCallback = callback;
    return this;
  }

  onUpdate(callback: AnyFunction) {
    this.onUpdateCallback = callback;
    return this;
  }

  onComplete(callback: AnyFunction) {
    this.onCompleteCallback = callback;
    return this;
  }

  onStop(callback: AnyFunction) {
    this.onCompleteCallback = callback;
    return this;
  }
}
