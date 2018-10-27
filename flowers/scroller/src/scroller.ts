import animateHelper from './aimate';

type ScrollerCallback = (left: number, top: number, zoom: number) => any;
interface Touch {
  pageX: number;
  pageY: number;
}

type ScrollerOptions = Partial<Scroller['defualtOptions']>;

interface ScrollerPosition {
  scrollLeft: number;
  scrollTop: number;
  timeStamp: number;
}

export class Scroller {
  // #region parameters
  // 外层尺寸，位置
  private containerWidth!: number;
  private containerHeight!: number;
  private containerLeft = 0;
  private containerTop = 0;
  // 内容尺寸
  private contentWidth!: number;
  private contentHeight!: number;

  private zoomLevel = 1;
  // x轴移动距离
  private scrollLeft = 0;
  // y轴移动距离
  private scrollTop = 0;
  /**
   * 最多能往左边移动的距离
   *
   * @private
   * @type {number}
   * @memberof Scroller
   */
  private maxScrollLeft!: number;
  /**
   * 最多能往上移动的距离
   *
   * @private
   * @type {number}
   * @memberof Scroller
   */
  private maxScrollTop!: number;

  // touches
  private initialTouchLeft!: Touch['pageX'];
  private initialTouchTop!: Touch['pageY'];
  private lastTouchLeft!: Touch['pageX'];
  private lastTouchTop!: Touch['pageY'];
  private lastTouchTime!: number;

  private lastScale!: number;
  private isTracking!: boolean;
  private isSingleTouch!: boolean;
  private isDragging!: boolean;

  private enableScrollX!: boolean;
  private enableScrollY!: boolean;

  private snapWidth = 100;
  private snapHeight = 100;

  // 判断是否处在touchend时，引发的动画中。可能记录animate id
  private isAnimating!: false | number;

  private positions: ScrollerPosition[] = [];

  private decelerationVelocityX!: number;
  private decelerationVelocityY!: number;

  // 是否在swipe引起的减速动画中，可能记录animate id
  private isDecelerating!: boolean | number;

  // deceleration range
  private minDecelerationScrollLeft!: number;
  private minDecelerationScrollTop!: number;
  private maxDecelerationScrollLeft!: number;
  private maxDecelerationScrollTop!: number;

  // pull to refresh
  private refreshHeight!: number;
  private refreshActive = false;
  private refreshActivate!: AnyFunction;
  private refreshDeactivate!: AnyFunction;
  private refreshStart?: AnyFunction;

  private defualtOptions = {
    // zoom limit
    maxZoom: 3,
    minZoom: 0.5,
    // scroll ability
    scrollingX: true,
    scrollingY: true,
    bouncing: true,
    snapping: false,
    paging: false,
    animate: false,
    animationDuration: 250,
    zooming: false,
    penetrationDeceleration: 0.03,
    penetrationAcceleration: 0.0
  };

  private options: ScrollerOptions;
  // #endregion

  constructor(private callback: ScrollerCallback, options?: ScrollerOptions) {
    this.options = Object.assign(this.defualtOptions, options || {});
  }

  // #region public api
  setDimensions(containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
    this.computeScrollMax();
    this.scrollTo(this.scrollLeft, this.scrollTop, (null as any) as number, true);
  }

  setPosition(left: number, top: number) {
    this.containerLeft = left;
    this.containerTop = top;
  }

  setSnapSize(width: number, height: number) {
    this.snapWidth = width;
    this.snapHeight = height;
  }

  /**
   * 处理touchstart event
   *
   * @param {Touch[]} touches
   * @param {number} timeStamp
   * @memberof Scroller
   */
  handleTouchStart(touches: Touch[], timeStamp: number) {
    const isSingleTouch = touches.length === 1;
    let currentTouchLeft: number;
    let currentTouchTop: number;
    if (isSingleTouch) {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    } else {
      currentTouchLeft = Math.abs((touches[0].pageX + touches[1].pageX) / 2);
      currentTouchTop = Math.abs((touches[0].pageY + touches[1].pageY) / 2);
    }

    if (this.isAnimating) {
      animateHelper.stop(this.isAnimating as number);
      this.isAnimating = false;
    }

    if (this.isDecelerating) {
      animateHelper.stop(this.isDecelerating as number);
      this.isDecelerating = false;
    }

    this.initialTouchLeft = currentTouchLeft;
    this.initialTouchTop = currentTouchTop;

    this.lastTouchLeft = currentTouchLeft;
    this.lastTouchTop = currentTouchTop;

    this.lastTouchTime = timeStamp;

    this.lastScale = 1;

    this.isSingleTouch = isSingleTouch;

    // 两个手指触摸应该立即处理
    this.isDragging = !isSingleTouch;

    this.enableScrollX = !isSingleTouch && this.options.scrollingX!;
    this.enableScrollY = !isSingleTouch && this.options.scrollingY!;

    this.isTracking = true;
  }

  /**
   * 处理touchmove
   *
   * @param {Touch[]} touches
   * @param {number} timeStamp
   * @param {number} scale
   * @memberof Scroller
   */
  handleTouchMove(touches: Touch[], timeStamp: number, scale: number) {
    if (!this.isTracking) {
      return;
    }

    let currentTouchLeft: number;
    let currentTouchTop: number;
    if (touches.length === 2) {
      currentTouchLeft = Math.abs((touches[0].pageX + touches[1].pageX) / 2);
      currentTouchTop = Math.abs((touches[0].pageY + touches[1].pageY) / 2);
    } else {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    }

    let scrollLeft = this.scrollLeft;
    let scrollTop = this.scrollTop;
    let zoomLevel = this.zoomLevel;
    if (this.isDragging) {
      if (scale != null && this.options.zooming) {
        const oldZoomLevel = zoomLevel;
        zoomLevel = zoomLevel * (scale / this.lastScale);
        zoomLevel = Math.max(Math.min(zoomLevel, this.options.maxZoom!), this.options.minZoom!);

        if (zoomLevel !== oldZoomLevel) {
          const currentTouchLeftRel = currentTouchLeft - this.containerLeft;
          const currentTouchTopRel = currentTouchTop - this.containerTop;

          scrollLeft = ((scrollLeft + currentTouchLeftRel) * zoomLevel) / oldZoomLevel - currentTouchLeftRel;
          scrollTop = ((scrollTop + currentTouchTopRel) * zoomLevel) / oldZoomLevel - currentTouchTopRel;
        }
      }

      if (this.enableScrollX) {
        const distanceX = currentTouchLeft - this.lastTouchLeft;
        scrollLeft -= distanceX;
        if (scrollLeft > this.maxScrollLeft || scrollLeft < 0) {
          if (this.options.bouncing) {
            scrollLeft += distanceX / 2;
          } else if (scrollLeft > this.maxScrollLeft) {
            scrollLeft = this.maxScrollLeft;
          } else if (scrollLeft < 0) {
            scrollLeft = 0;
          }
        }
      }

      if (this.enableScrollY) {
        const distanceY = currentTouchTop - this.lastTouchTop;
        scrollTop -= distanceY;
        if (scrollTop > this.maxScrollTop || scrollTop < 0) {
          if (this.options.bouncing) {
            scrollTop += distanceY / 2;

            if (!this.options.scrollingX && this.refreshHeight != null) {
              if (!this.refreshActive && scrollTop <= -this.refreshHeight) {
                this.refreshActive = true;
                if (this.refreshActivate) {
                  this.refreshActivate();
                }
              } else if (this.refreshActive && scrollTop > -this.refreshHeight) {
                this.refreshActive = false;
                if (this.refreshDeactivate) {
                  this.refreshDeactivate();
                }
              }
            }
          } else if (scrollTop > this.maxScrollTop) {
            scrollTop = this.maxScrollTop;
          } else if (scrollTop < 0) {
            scrollTop = 0;
          }
        }
      }

      if (this.positions.length > 20) {
        this.positions.splice(0, 10);
      }
      this.positions.push({
        scrollLeft,
        scrollTop,
        timeStamp
      });

      this.publish(scrollLeft, scrollTop, zoomLevel);
    } else {
      this.isDragging = true;
      this.enableScrollX = this.options.scrollingX!;
      this.enableScrollY = this.options.scrollingY!;
    }

    this.lastTouchLeft = currentTouchLeft;
    this.lastTouchTop = currentTouchTop;
    this.lastScale = scale;
    this.lastTouchTime = timeStamp;
  }

  /**
   * 处理touchend
   *
   * @param {number} timeStamp
   * @memberof Scroller
   */
  handleTouchEnd(timeStamp: number) {
    this.isTracking = false;

    const positions = this.positions;

    if (this.isDragging) {
      this.isDragging = false;

      if (this.isSingleTouch && this.options.animate && timeStamp - this.lastTouchTime < 100) {
        const endIndex = positions.length - 1;
        let startIndex = endIndex;
        for (let i = endIndex; i > 0 && positions[i].timeStamp > this.lastTouchTime - 100; i--) {
          startIndex = i;
        }
        if (startIndex !== endIndex) {
          const timeOffset = positions[endIndex].timeStamp - positions[startIndex].timeStamp;
          const movedLeft = positions[endIndex].scrollLeft - positions[startIndex].scrollLeft;
          const movedTop = positions[endIndex].scrollTop - positions[startIndex].scrollTop;

          // (px/ms)*(ms/frame)=px/frame
          this.decelerationVelocityX = (movedLeft / timeOffset) * (1000 / 60);
          this.decelerationVelocityY = (movedTop / timeOffset) * (1000 / 60);

          const minVelocityToStartDeceleration = this.options.paging || this.options.snapping ? 4 : 1;
          if (
            Math.abs(this.decelerationVelocityX) > minVelocityToStartDeceleration ||
            Math.abs(this.decelerationVelocityY) > minVelocityToStartDeceleration
          ) {
            this.startDeceleration();
          }
        }
      }
    }

    if (!this.isDecelerating) {
      if (this.refreshActive && this.refreshStart) {
        this.publish(this.scrollLeft, -this.refreshHeight, this.zoomLevel, true);

        this.refreshStart();
      } else {
        if (this.refreshActive) {
          this.refreshActive = false;
          if (this.refreshDeactivate) {
            this.refreshDeactivate();
          }
        }
        this.scrollTo(this.scrollLeft, this.scrollTop, this.zoomLevel, true);
      }
    }

    this.positions = [];
  }

  /**
   * handle mousewheel event
   *
   * @param {number} wheelDelta
   * @param {number} pageX
   * @param {number} pageY
   * @memberof Scroller
   */
  handleMouseWheel(wheelDelta: number, pageX: number, pageY: number) {
    const ratio = wheelDelta < 0 ? 1.03 : 0.97;
    this.zoomTo(this.zoomLevel * ratio, pageX - this.containerLeft, pageY - this.containerTop);
  }

  zoomTo(zoomLevel: number, originLeft: number, originTop: number) {
    if (!this.options.zooming) {
      // tslint:disable-next-line: no-console
      console.warn('zooming is not enabled!');
      return;
    }

    const oldZoomLevel = this.zoomLevel;

    this.computeScrollMax(zoomLevel);

    zoomLevel = Math.max(Math.min(zoomLevel, this.options.maxZoom!), this.options.minZoom!);

    let left = (originLeft + this.scrollLeft) * (zoomLevel / oldZoomLevel) - originLeft;
    let top = (originTop + this.scrollTop) * (zoomLevel / oldZoomLevel) - originTop;

    if (left > this.maxScrollLeft) {
      left = this.maxScrollLeft;
    } else if (left < 0) {
      left = 0;
    }

    if (top > this.maxScrollTop) {
      top = this.maxScrollTop;
    } else if (top < 0) {
      top = 0;
    }

    this.publish(left, top, zoomLevel);
  }

  /**
   * scrollTo 会计算最终目的地
   *
   * @param {number} left
   * @param {number} top
   * @param {number} [zoomLevel]
   * @param {boolean} [animate]
   * @returns
   * @memberof Scroller
   */
  scrollTo(left: number, top: number, zoomLevel?: number, animate?: boolean) {
    if (this.isDecelerating) {
      animateHelper.stop(this.isDecelerating as number);
      this.isDecelerating = false;
    }

    if (zoomLevel != null && zoomLevel !== this.zoomLevel) {
      if (!this.options.zooming) {
        // tslint:disable-next-line: no-console
        console.warn('zooming is not enabled!');
        return;
      }

      left *= zoomLevel;
      top *= zoomLevel;
      this.computeScrollMax(zoomLevel);
    } else {
      zoomLevel = this.zoomLevel;
    }

    if (!this.options.scrollingX) {
      left = this.scrollLeft;
    } else {
      if (this.options.snapping) {
        left = Math.round(left / this.snapWidth) * this.snapWidth;
      } else if (this.options.paging) {
        left = Math.round(left / this.containerWidth) * this.containerWidth;
      }
    }

    if (!this.options.scrollingY) {
      top = this.scrollTop;
    } else {
      if (this.options.snapping) {
        top = Math.round(top / this.snapHeight) * this.snapHeight;
      } else if (this.options.paging) {
        top = Math.round(top / this.containerHeight) * this.containerHeight;
      }
    }

    left = Math.max(Math.min(left, this.maxScrollLeft), 0);
    top = Math.max(Math.min(top, this.maxScrollTop), 0);

    // 如果是处于触摸状态，不能发布
    if (!this.isTracking) {
      this.publish(left, top, zoomLevel, animate);
    }
  }

  /**
   * 激活下拉刷新功能
   *
   * @param {number} height 超过这个值，激活刷新
   * @param {AnyFunction} activateCallback 激活时的回调
   * @param {AnyFunction} deactivateCallback 取消激活回调
   * @param {AnyFunction} startCallback 刷新时带副作用的回调
   * @memberof Scroller
   */
  activatePullToRefresh(
    height: number,
    activateCallback: AnyFunction,
    deactivateCallback: AnyFunction,
    startCallback?: AnyFunction
  ) {
    this.refreshHeight = height;
    this.refreshActivate = activateCallback;
    this.refreshDeactivate = deactivateCallback;
    this.refreshStart = startCallback;
  }

  /**
   * refreshStart完成后调用
   *
   * @memberof Scroller
   */
  finishPullToRefresh() {
    this.refreshActive = false;

    if (this.refreshDeactivate) {
      this.refreshDeactivate();
    }

    this.scrollTo(this.scrollLeft, this.scrollTop, this.zoomLevel, true);
  }

  /**
   * 将计算好的数据发布出去
   *
   * @private
   * @param {number} left
   * @param {number} top
   * @param {number} zoom
   * @memberof Scroller
   */
  private publish(left: number, top: number, zoom: number, animate?: boolean) {
    if (this.isAnimating) {
      animateHelper.stop(this.isAnimating as number);
      this.isAnimating = false;
    }

    if (animate && this.options.animate) {
      const oldLeft = this.scrollLeft;
      const oldTop = this.scrollTop;
      const oldZoomLevel = this.zoomLevel;

      const diffLeft = left - oldLeft;
      const diffTop = top - oldTop;
      const diffZoomLevel = this.zoomLevel - oldZoomLevel;

      const step = (percent: number) => {
        this.scrollLeft = oldLeft + diffLeft * percent;
        this.scrollTop = oldTop + diffTop * percent;
        this.zoomLevel = oldZoomLevel + diffZoomLevel * percent;

        if (this.callback) {
          this.callback(this.scrollLeft, this.scrollTop, this.zoomLevel);
        }
      };

      const complete = (renderedFramesPerSecond: number, animateId: number, finishedAnimation: boolean) => {
        if (animateId === this.isAnimating) {
          this.isAnimating = false;
        }
      };

      const verify = (animateId: number) => {
        return this.isAnimating === animateId;
      };

      this.isAnimating = animateHelper.start(step, verify, complete, this.options.animationDuration!);
    } else {
      this.scrollLeft = left;
      this.scrollTop = top;
      this.zoomLevel = zoom;
      if (this.callback) {
        this.callback(left, top, zoom);
      }
    }
  }

  private computeScrollMax(zoomLevel?: number) {
    if (zoomLevel == null) {
      zoomLevel = this.zoomLevel;
    }
    this.maxScrollLeft = Math.max(this.contentWidth * this.zoomLevel - this.containerWidth, 0);
    this.maxScrollTop = Math.max(this.contentHeight * this.zoomLevel - this.containerHeight, 0);
  }

  private startDeceleration() {
    // caculate range
    if (this.options.paging) {
      const scrollLeft = Math.max(Math.min(this.maxScrollLeft, this.scrollLeft), 0);
      const scrollTop = Math.max(Math.min(this.maxScrollTop, this.scrollTop), 0);

      this.minDecelerationScrollLeft = Math.floor(scrollLeft / this.containerWidth) * this.containerWidth;
      this.minDecelerationScrollTop = Math.floor(scrollTop / this.containerHeight) * this.containerHeight;
      this.maxDecelerationScrollLeft = Math.ceil(scrollLeft / this.containerWidth) * this.containerWidth;
      this.maxDecelerationScrollTop = Math.ceil(scrollTop / this.containerHeight) * this.containerHeight;
    } else {
      this.minDecelerationScrollLeft = 0;
      this.minDecelerationScrollTop = 0;
      this.maxDecelerationScrollLeft = this.maxScrollLeft;
      this.maxDecelerationScrollTop = this.maxScrollTop;
    }
    const step = () => {
      this.stepThroughDeceleration();
    };

    const minVelocityToKeepDecelerating = this.options.snapping || this.options.paging ? 4 : 0.001;

    const verify = () => {
      // console.log(this.decelerationVelocityX, this.decelerationVelocityY);
      const shouldContinue =
        Math.abs(this.decelerationVelocityX) >= minVelocityToKeepDecelerating ||
        Math.abs(this.decelerationVelocityY) >= minVelocityToKeepDecelerating;
      return shouldContinue;
    };

    const complete = () => {
      this.isDecelerating = false;
      this.scrollTo(this.scrollLeft, this.scrollTop, this.zoomLevel, this.options.snapping || this.options.paging);
    };

    // 不能指定animation duration，要根据deceleration来判断animation state
    this.isDecelerating = animateHelper.start(step, verify, complete);
  }

  private stepThroughDeceleration() {
    let scrollLeft = this.scrollLeft + this.decelerationVelocityX;
    let scrollTop = this.scrollTop + this.decelerationVelocityY;

    if (!this.options.bouncing) {
      const scrollLeftFixed = Math.max(
        Math.min(this.maxDecelerationScrollLeft, scrollLeft),
        this.minDecelerationScrollLeft
      );
      if (scrollLeftFixed !== scrollLeft) {
        scrollLeft = scrollLeftFixed;
        this.decelerationVelocityX = 0;
      }

      const scrollTopFixed = Math.max(
        Math.min(this.maxDecelerationScrollTop, scrollTop),
        this.minDecelerationScrollTop
      );
      if (scrollTopFixed !== scrollTop) {
        scrollTop = scrollLeftFixed;
        this.decelerationVelocityY = 0;
      }
    }

    this.publish(scrollLeft, scrollTop, this.zoomLevel);

    // friction
    const friction = 0.95;
    this.decelerationVelocityX *= friction;
    this.decelerationVelocityY *= friction;

    // 机智的减速加速
    if (this.options.bouncing) {
      const penetrationDeceleration = this.options.penetrationDeceleration!;
      const penetrationAcceleration = this.options.penetrationAcceleration!;
      let scrollOutsideX = 0;
      let scrollOutsideY = 0;

      if (scrollLeft < this.minDecelerationScrollLeft) {
        scrollOutsideX = this.minDecelerationScrollLeft - scrollLeft;
      } else if (scrollLeft > this.maxDecelerationScrollLeft) {
        scrollOutsideX = this.maxDecelerationScrollLeft - scrollLeft;
      }

      if (scrollTop < this.minDecelerationScrollTop) {
        scrollOutsideY = this.minDecelerationScrollTop - scrollTop;
      } else if (scrollTop > this.maxDecelerationScrollTop) {
        scrollOutsideY = this.maxDecelerationScrollTop - scrollTop;
      }

      if (scrollOutsideX !== 0) {
        if (scrollOutsideX * this.decelerationVelocityX <= 0) {
          this.decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        } else {
          this.decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }

      if (scrollOutsideY !== 0) {
        if (scrollOutsideY * this.decelerationVelocityY <= 0) {
          this.decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        } else {
          this.decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
    }
  }
}
