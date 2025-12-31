import { sanityClient } from '../lib/sanityClient'

type Guide = {
  title: string
  content: string
}

export default async function Home() {
  const guide: Guide = await sanityClient.fetch(
    `*[_type == "guide"][0]{title, content}`
  )

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">
          {guide?.title ?? 'Нет заголовка'}
        </h1>
        <p className="text-lg whitespace-pre-line">
          {guide?.content ?? 'Нет контента'}
        </p>
      </div>
    </main>
  )
}
