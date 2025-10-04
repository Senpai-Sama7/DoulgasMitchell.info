import { addBentoBlocks } from '../cms/src/admin/grapesjs-blocks.js';

const blocks = [];
const editor = {
  BlockManager: {
    add: (id, def) => {
      blocks.push({ id, label: def.label, category: def.category, content: def.content });
    },
  },
};

addBentoBlocks(editor);

console.log(JSON.stringify(blocks, null, 2));
