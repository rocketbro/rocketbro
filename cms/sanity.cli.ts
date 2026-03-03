import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'p7pfl2f8',
    dataset: 'production',
  },
  deployment: {
    appId: 'pcdiyvdqgu1ntscf34rmnm48',
  },
  typegen: {
    path: '../lib/sanity/queries.ts',
    schema: './schema.json',
    generates: '../lib/sanity/types.ts',
  },
})
