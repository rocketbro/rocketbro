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
      name: 'isPasswordProtected',
      title: 'Password protect this loom',
      type: 'boolean',
      initialValue: false,
      description: 'Require a password before this loom can be viewed on the site.',
    }),
    defineField({
      name: 'accessPassword',
      title: 'Loom password',
      type: 'string',
      hidden: ({document}) => !document?.isPasswordProtected,
      description: 'Stored in Sanity and checked server-side before granting access.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as {isPasswordProtected?: boolean} | undefined
          if (!document?.isPasswordProtected) {
            return true
          }

          if (typeof value !== 'string' || value.trim().length === 0) {
            return 'Password is required when protection is enabled.'
          }

          return true
        }),
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
