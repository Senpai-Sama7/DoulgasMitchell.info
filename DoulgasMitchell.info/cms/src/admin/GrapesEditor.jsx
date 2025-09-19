'use client';
import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { registerBentoBlocks } from './grapesjs-bento-blocks';
import { addBentoBlocks } from './grapesjs-blocks';

export default function GrapesEditor({ path, value, onChange }) {
  const elRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return;

    const editor = grapesjs.init({
      container: elRef.current,
      height: '650px',
      fromElement: false,
      storageManager: { autoload: false, autosave: false },
      canvas: {
        styles: [
          // minimal reset and fonts, frontend CSS not loaded here
          'https://unpkg.com/modern-css-reset/dist/reset.min.css'
        ]
      }
    });
    editorRef.current = editor;
    registerBentoBlocks(editor);

    // Add custom blocks
    addBentoBlocks(editor);

    // Load existing HTML if available
    if (value) {
      try {
        editor.setComponents(value);
      } catch {
        // ignore
      }
    }

    const handler = () => {
      const html = editor.getHtml();
      const css = editor.getCss();
      const doc = `<style>${css}</style>${html}`;
      onChange && onChange(doc);
    };
    editor.on('component:add', handler);
    editor.on('component:update', handler);
    editor.on('component:remove', handler);
    editor.on('styleManager:change', handler);
    editor.on('storage:store', handler);

    return () => {
      editor.destroy();
    };
  }, [elRef]);

  return <div ref={elRef} />;
}
