import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'markdownFileLink',
  title: 'Markdown File Link',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title Override',
      type: 'string',
      description: 'Optional title shown at the top of the pop-up.',
    }),
    defineField({
      name: 'resource',
      title: 'Markdown File',
      type: 'reference',
      to: [{type: 'markdownResource'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      resourceTitle: 'resource.title',
      filename: 'resource.file.asset.originalFilename',
    },
    prepare(selection) {
      return {
        title: selection.title || selection.resourceTitle || selection.filename || 'Markdown File',
        subtitle: 'Opens in a pop-up',
      }
    },
  },
})
