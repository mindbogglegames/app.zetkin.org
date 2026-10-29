import { OutputBlockData } from '@editorjs/editorjs';

import htmlToInlineNodes from './htmlToInlineNodes';
import {
  BLOCK_TYPES,
  BlockKind,
  EmailContentBlock,
  EmailContentInlineNode,
  InlineNodeKind,
} from '../types';

export default function editorjsBlocksToZetkinBlocks(
  editorjsBlocks: OutputBlockData[]
) {
  const zetkinBlocks: EmailContentBlock[] = [];
  const usedTags = new Set<string>();

  const uniqueTag = (tag: string | undefined) => {
    let newTag = tag;
    while (!newTag || usedTags.has(newTag)) {
      newTag = Math.random().toString(36).substring(2, 10);
    }
    usedTags.add(newTag);
    return newTag;
  };

  const withUniqueLinkTags = (
    nodes: EmailContentInlineNode[]
  ): EmailContentInlineNode[] =>
    nodes.map((node) => {
      if (node.kind === InlineNodeKind.LINK) {
        return {
          ...node,
          content: withUniqueLinkTags(node.content),
          tag: uniqueTag(node.tag),
        };
      } else if (
        node.kind === InlineNodeKind.BOLD ||
        node.kind === InlineNodeKind.ITALIC
      ) {
        return { ...node, content: withUniqueLinkTags(node.content) };
      } else {
        return node;
      }
    });

  editorjsBlocks.forEach((editorjsBlock) => {
    if (editorjsBlock.type === BLOCK_TYPES.BUTTON) {
      zetkinBlocks.push({
        data: {
          href: editorjsBlock.data.url,
          tag: uniqueTag(editorjsBlock.data.tag),
          text: editorjsBlock.data.buttonText,
        },
        kind: BlockKind.BUTTON,
      });
    } else if (editorjsBlock.type === BLOCK_TYPES.HEADER) {
      zetkinBlocks.push({
        data: {
          content: withUniqueLinkTags(
            htmlToInlineNodes(editorjsBlock.data.text)
          ),
          level: editorjsBlock.data.level,
        },
        kind: BlockKind.HEADER,
      });
    } else if (editorjsBlock.type === BLOCK_TYPES.LIBRARY_IMAGE) {
      zetkinBlocks.push({
        data: {
          alt: editorjsBlock.data.fileName,
          fileId: editorjsBlock.data.fileId,
          src: editorjsBlock.data.url,
        },
        kind: BlockKind.IMAGE,
      });
    } else if (editorjsBlock.type === BLOCK_TYPES.PARAGRAPH) {
      zetkinBlocks.push({
        data: {
          content: withUniqueLinkTags(
            htmlToInlineNodes(editorjsBlock.data.text)
          ),
        },
        kind: BlockKind.PARAGRAPH,
      });
    }
  });

  return zetkinBlocks;
}
