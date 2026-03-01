import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'p7pfl2f8',
    dataset: 'production',
  },
  typegen: {
    path: '../lib/sanity/queries.ts',
    schema: './schema.json',
    generates: '../lib/sanity/types.ts',
  },
})
