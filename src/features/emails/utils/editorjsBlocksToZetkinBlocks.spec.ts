import { describe, expect, it } from '@jest/globals';

import editorjsBlocksToZetkinBlocks from './editorjsBlocksToZetkinBlocks';
import { BLOCK_TYPES, BlockKind, InlineNodeKind } from '../types';

describe('editorjsBlocksToZetkinBlocks()', () => {
  it('does nothing when passed an empty array', () => {
    const zetkinBlocks = editorjsBlocksToZetkinBlocks([]);

    expect(zetkinBlocks).toHaveLength(0);
  });

  it('converts Button block', () => {
    const zetkinBlocks = editorjsBlocksToZetkinBlocks([
      {
        data: {
          buttonText: 'Click me!',
          id: 'aä09ssldk',
          tag: 'abcdefgh',
          url: 'http://www.zetkin.org',
        },
        type: BLOCK_TYPES.BUTTON,
      },
    ]);

    expect(zetkinBlocks).toEqual([
      {
        data: {
          href: 'http://www.zetkin.org',
          tag: 'abcdefgh',
          text: 'Click me!',
        },
        kind: BlockKind.BUTTON,
      },
    ]);
  });

  it('converts header block', () => {
    const zetkinBlocks = editorjsBlocksToZetkinBlocks([
      {
        data: {
          level: 1,
          text: 'Hello!',
        },
        type: BLOCK_TYPES.HEADER,
      },
    ]);

    expect(zetkinBlocks).toEqual([
      {
        data: {
          content: [
            {
              kind: InlineNodeKind.STRING,
              value: 'Hello!',
            },
          ],
          level: 1,
        },
        kind: BlockKind.HEADER,
      },
    ]);
  });

  it('converts image block', () => {
    const zetkinBlocks = editorjsBlocksToZetkinBlocks([
      {
        data: {
          fileId: 2,
          fileName: 'clara.jpg',
          url: 'http://files.zetkin.org/1/clara.jpg',
        },
        type: BLOCK_TYPES.LIBRARY_IMAGE,
      },
    ]);

    expect(zetkinBlocks).toEqual([
      {
        data: {
          alt: 'clara.jpg',
          fileId: 2,
          src: 'http://files.zetkin.org/1/clara.jpg',
        },
        kind: BlockKind.IMAGE,
      },
    ]);
  });

  it('converts paragraph block', () => {
    const zetkinBlocks = editorjsBlocksToZetkinBlocks([
      {
        data: {
          text: 'Welcome to our cool <b>party!</b>',
        },
        type: BLOCK_TYPES.PARAGRAPH,
      },
    ]);

    expect(zetkinBlocks).toEqual([
      {
        data: {
          content: [
            {
              kind: InlineNodeKind.STRING,
              value: 'Welcome to our cool ',
            },
            {
              content: [
                {
                  kind: InlineNodeKind.STRING,
                  value: 'party!',
                },
              ],
              kind: InlineNodeKind.BOLD,
            },
          ],
        },
        kind: BlockKind.PARAGRAPH,
      },
    ]);
  });

  it('gives copied links and buttons unique tags', () => {
    const zetkinBlocks = editorjsBlocksToZetkinBlocks([
      {
        data: {
          text: '<a class="inlineLink" href="http://zetkin.org" data-tag="abcdefgh">Zetkin</a>',
        },
        type: BLOCK_TYPES.PARAGRAPH,
      },
      {
        data: {
          text: '<b><a class="inlineLink" href="http://zetkin.org" data-tag="abcdefgh">Zetkin</a></b>',
        },
        type: BLOCK_TYPES.PARAGRAPH,
      },
      {
        data: {
          buttonText: 'Click me!',
          tag: 'abcdefgh',
          url: 'http://zetkin.org',
        },
        type: BLOCK_TYPES.BUTTON,
      },
    ]);

    const [first, second, button] = zetkinBlocks;
    if (
      first.kind !== BlockKind.PARAGRAPH ||
      second.kind !== BlockKind.PARAGRAPH ||
      button.kind !== BlockKind.BUTTON
    ) {
      throw new Error('Unexpected block kinds');
    }

    const firstLink = first.data.content[0];
    const bold = second.data.content[0];
    if (
      firstLink.kind !== InlineNodeKind.LINK ||
      bold.kind !== InlineNodeKind.BOLD
    ) {
      throw new Error('Unexpected node kinds');
    }
    const secondLink = bold.content[0];
    if (secondLink.kind !== InlineNodeKind.LINK) {
      throw new Error('Unexpected node kind');
    }

    const tags = [firstLink.tag, secondLink.tag, button.data.tag];
    expect(firstLink.tag).toBe('abcdefgh');
    expect(new Set(tags).size).toBe(3);
    tags.forEach((tag) => expect(tag).toMatch(/^[a-z0-9]+$/));
  });
});
