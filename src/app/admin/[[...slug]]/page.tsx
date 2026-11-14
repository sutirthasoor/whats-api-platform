import { PageHost } from '@/components/demo/page-host'

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return <PageHost k={slug?.join('/') || 'dashboard'} />
}
