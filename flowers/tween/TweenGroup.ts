import { Tween } from './Tween';
import { now } from './now';

export class TweenGroup {
  private tweens = new Map<Tween['id'], Tween>();

  create(object: Tween['object']) {
    return new Tween(object, this);
  }

  add(tween: Tween) {
    return this.tweens.set(tween.getId(), tween);
  }

  remove(tween: Tween) {
    return this.tweens.delete(tween.getId());
  }

  update(time?: number) {
    if (this.tweens.size === 0) {
      return false;
    }

    for (const tween of this.tweens.values()) {
      if (tween && tween.update(time || now()) === false) {
        tween.isPlaying = false;
        this.tweens.delete(tween.getId());
      }
    }
    return true;
  }
}

export const TWEEN = new TweenGroup();
