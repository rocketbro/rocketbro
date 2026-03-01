import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'loom',
  title: 'Loom',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'openLoomFile',
      title: 'OpenLoom JSON File',
      type: 'file',
      options: {
        accept: '.json,application/json',
      },
      validation: (Rule) => Rule.required(),
      description: 'Upload an exported .openloom.json file',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})
