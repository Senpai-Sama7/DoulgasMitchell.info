const Posts = {
  slug: 'posts',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, required: true },
    {
      name: 'kind', type: 'select', required: true, defaultValue: 'Article',
      options: ['Article','Video','Audio','Gallery','Notes']
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'tags', type: 'array', labels: { singular: 'Tag', plural: 'Tags' },
      fields: [{ name: 'value', type: 'text' }]
    },
    { name: 'excerpt', type: 'textarea' },
    // Simple HTML field for content so frontend can render directly
    { name: 'contentHtml', type: 'textarea' },

    // Type-specific helpers
    { name: 'videoUrl', type: 'text', admin: { condition: (_, data) => data.kind === 'Video' } },
    { name: 'audioUrl', type: 'text', admin: { condition: (_, data) => data.kind === 'Audio' } },
    {
      name: 'gallery', type: 'array', admin: { condition: (_, data) => data.kind === 'Gallery' },
      fields: [{ name: 'imageUrl', type: 'text' }, { name: 'alt', type: 'text' }]
    },
    { name: 'date', type: 'date', defaultValue: () => new Date().toISOString() },
  ],
};
export default Posts;
