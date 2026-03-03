import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'markdownResource',
  title: 'Markdown Files',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'Markdown File',
      type: 'file',
      options: {
        accept: '.md,.markdown,text/markdown,text/plain',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      filename: 'file.asset.originalFilename',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Untitled markdown file',
        subtitle: selection.filename || 'No file uploaded',
      }
    },
  },
})
