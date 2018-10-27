import { Scroller } from './src/scroller';
import toArray from 'lodash.toarray';
import { draw } from './test';

const container = document.getElementById('container')!;
const content = document.getElementById('content')!;

draw(container, content, 'normal')!();

function setup() {
  const scroller = new Scroller(
    (left: number, top: number, zoom: number) => {
      content.style.transform = `translate(${-left}px, ${-top}px) scale(${zoom})`;
    },
    {
      scrollingX: true,
      scrollingY: true,
      snapping: false,
      paging: false,
      animate: true,
      animationDuration: 150,
      bouncing: true
    }
  );

  scroller.setDimensions(container.clientWidth, container.clientHeight, content.offsetWidth, content.offsetHeight);
  scroller.setPosition(
    container.getBoundingClientRect().left + container.clientLeft,
    container.getBoundingClientRect().top + container.clientTop
  );
  scroller.setSnapSize(50, 50);

  content.addEventListener('wheel', e => {
    scroller.handleMouseWheel(e.wheelDelta, e.pageX, e.pageY);
  });

  if ('ontouchstart' in window) {
    content.addEventListener('touchstart', e => {
      scroller.handleTouchStart(toArray(e.touches), e.timeStamp);
      e.preventDefault();
    });

    document.addEventListener('touchmove', e => {
      scroller.handleTouchMove(toArray(e.touches), e.timeStamp, (e as any).scale as number);
    });

    document.addEventListener('touchend', e => {
      scroller.handleTouchEnd(e.timeStamp);
    });
  } else {
    let mousedown = false;
    content.addEventListener('mousedown', e => {
      scroller.handleTouchStart([{ pageX: e.pageX, pageY: e.pageY }], e.timeStamp);
      mousedown = true;
    });

    document.addEventListener('mousemove', e => {
      if (!mousedown) {
        return;
      }
      scroller.handleTouchMove([{ pageX: e.pageX, pageY: e.pageY }], e.timeStamp, (null as any) as number);
      mousedown = true;
    });

    document.addEventListener('mouseup', e => {
      if (!mousedown) {
        return;
      }
      scroller.handleTouchEnd(e.timeStamp);
      mousedown = true;
    });
  }
}

setup();
