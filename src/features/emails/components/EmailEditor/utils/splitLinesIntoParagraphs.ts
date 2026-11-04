const BLOCK_SELECTOR =
  'address, blockquote, div, h1, h2, h3, h4, h5, h6, li, p, pre, td, th';
const KEEP_TAG_SELECTOR = 'h1, h2, h3, h4, h5, h6, p';

function wrapLine(content: DocumentFragment, block: Element): Node {
  if (content.querySelector(BLOCK_SELECTOR)) {
    return content;
  }

  const wrapper = block.matches(KEEP_TAG_SELECTOR)
    ? block.cloneNode(false)
    : document.createElement('p');
  wrapper.appendChild(content);
  return wrapper;
}

function splitBlock(block: Element) {
  const lineBreaks = Array.from(block.querySelectorAll('br')).filter(
    (br) => br.parentElement?.closest(BLOCK_SELECTOR) === block
  );

  const lines: Node[] = [];
  lineBreaks.forEach((br) => {
    const range = document.createRange();
    range.setStart(block, 0);
    range.setEndBefore(br);
    lines.push(wrapLine(range.extractContents(), block));
    br.remove();
  });

  const rest = document.createRange();
  rest.selectNodeContents(block);
  lines.push(wrapLine(rest.extractContents(), block));

  if (block.matches(KEEP_TAG_SELECTOR)) {
    block.replaceWith(...lines);
  } else {
    block.replaceChildren(...lines);
  }
}

export default function splitLinesIntoParagraphs(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;

  container.querySelectorAll('span:not([data-slug])').forEach((span) => {
    span.replaceWith(...Array.from(span.childNodes));
  });

  let br = container.querySelector('br');
  while (br) {
    const block = br.parentElement?.closest(BLOCK_SELECTOR) || container;
    splitBlock(block);
    br = container.querySelector('br');
  }

  return container.innerHTML;
}
