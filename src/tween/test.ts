import TWEEN, { Easing } from './index';

const test = document.getElementById('test')!;

const positon = { x: 0, y: 0 };

TWEEN.create(positon)
  .to(
    {
      x: 600,
      y: 300
    },
    3000
  )
  .easing(Easing.Elastic.Out)
  .onUpdate(object => {
    test.style.left = object.x + 'px';
    test.style.top = object.y + 'px';
  })
  .start();

function animate() {
  if (TWEEN.update()) {
    requestAnimationFrame(animate);
  }
}

animate();
