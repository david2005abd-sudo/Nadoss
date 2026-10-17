import StorePreview from '@/components/nasaq/store-preview';

// الشرائح المتاحة في التصدير الثابت — مشاريع المنصة الجاهزة.
export function generateStaticParams() {
  return [
    { slug: 'proj_store' },
    { slug: 'proj_restaurant' },
    { slug: 'proj_workshop' },
    { slug: 'proj_engineering' },
    { slug: 'proj_realestate' },
    { slug: 'proj_digital' },
  ];
}

export default function StorePage({ params }: { params: { slug: string } }) {
  return <StorePreview slug={params.slug} />;
}
