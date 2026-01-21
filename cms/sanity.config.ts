import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import type {StructureBuilder} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'rocketbro',

  projectId: 'p7pfl2f8',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Content')
          .items([
            // Settings singleton
            S.listItem()
              .title('Settings')
              .icon(() => '⚙️')
              .child(S.document().schemaType('settings').documentId('settings')),
            S.listItem()
              .title('Links')
              .icon(() => '🔗')
              .child(S.document().schemaType('links').documentId('links')),
            S.divider(),
            // Regular document types
            S.listItem()
              .title('Posts')
              .icon(() => '📝')
              .child(S.documentTypeList('post').title('Posts')),
            S.listItem()
              .title('Authors')
              .icon(() => '👤')
              .child(S.documentTypeList('author').title('Authors')),
            S.listItem()
              .title('Categories')
              .icon(() => '🏷️')
              .child(S.documentTypeList('category').title('Categories')),
          ]),
    }),
    visionTool(),
    codeInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
