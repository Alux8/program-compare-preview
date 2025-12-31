import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'x315h6cj',
  dataset: 'production',
  apiVersion: '2023-11-14', // можно любую недавнюю дату
  useCdn: true,
})
