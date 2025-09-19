import GrapesEditor from '../admin/GrapesEditor.jsx';

const Pages = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, required: true },
    // Store rendered HTML (including inlined <style>) from GrapesJS
    {
      name: 'layoutHtml',
      type: 'textarea',
      label: 'Visual Layout (HTML)',
      admin: {
        description: 'Use the visual editor to design this page layout',
        components: { Field: GrapesEditor }
      }
    }
  ],
};
export default Pages;
