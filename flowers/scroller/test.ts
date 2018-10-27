export function draw(container: HTMLElement, content: HTMLElement, type: 'normal' | 'page') {
  if (type === 'normal') {
    return function() {
      container.style.width = 500 + 'px';
      container.style.height = 500 + 'px';
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          const div = document.createElement('div');
          div.innerHTML = i + '' + j;
          if (i % 2 === 0) {
            if (j % 2 === 0) {
              div.className = 'cell';
            } else {
              div.className = 'cell dark';
            }
          } else {
            if (j % 2 === 0) {
              div.className = 'cell dark';
            } else {
              div.className = 'cell';
            }
          }
          fragment.appendChild(div);
          (div as any) = null;
        }
      }
      content.appendChild(fragment);
      (fragment as any) = null;
    };
  } else if (type === 'page') {
    return function() {
      container.style.width = 200 + 'px';
      container.style.height = 200 + 'px';
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          const div = document.createElement('div');
          div.innerHTML = i + '' + j;
          if ((j + 1) % 4 === 0) {
            div.className = 'cell';
          } else {
            div.className = 'cell dark';
          }
          fragment.appendChild(div);
          (div as any) = null;
        }
      }
      content.appendChild(fragment);
      (fragment as any) = null;
    };
  }
}
