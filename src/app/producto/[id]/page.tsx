import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Metadata } from 'next';
import { Star, StarHalf, SlidersHorizontal, ChevronDown, CheckCircle, Tag } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { ProductReviews } from '@/components/ProductReviews';
import { ProductGallery } from './ProductGallery';
import { ProductPurchaseSection } from './ProductPurchaseSection';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('title, description, image').eq('id', resolvedParams.id).single();

  const title = product ? product.title : 'Producto no encontrado';
  const description = product?.description || 'Detalles del producto en DRAVENIX';
  const image = product?.image || '';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | DRAVENIX`,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | DRAVENIX`,
      description,
      images: image ? [image] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select('*, brands(*), categories(*), supplement_information(*), product_images(*)')
    .eq('id', resolvedParams.id)
    .single();

  if (!product) {
    notFound();
  }

  const user = await getUser();
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(email)')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false });

  const allImages: string[] = [];
  if (product.image) allImages.push(product.image);
  if (product.product_images && Array.isArray(product.product_images)) {
    product.product_images.forEach((pi: any) => {
      if (pi.url) allImages.push(pi.url);
    });
  }

  const reviewsList = reviews || [];
  const avgRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length)
    : 0;

  const suppInfo = product.supplement_information 
    ? (Array.isArray(product.supplement_information) ? product.supplement_information[0] : product.supplement_information) 
    : null;

  const hasDiscount = Boolean(product.sale_price && product.sale_price < product.price);
  const discountPercent = hasDiscount && product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;
  
  const currentPrice = hasDiscount && product.sale_price ? product.sale_price : product.price;
  const originalPrice = hasDiscount ? product.price : null;

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center text-sm text-zinc-500 gap-2">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-zinc-900">Shop</Link>
          <span>&gt;</span>
          <Link href={`/shop?category_name=${product.categories?.name?.toLowerCase() || ''}`} className="hover:text-zinc-900 capitalize">
            {product.categories?.name || 'General'}
          </Link>
          <span>&gt;</span>
          <span className="text-zinc-900 truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* Left: Images */}
          <ProductGallery images={allImages} title={product.title} />

          {/* Right: Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="text-3xl lg:text-[40px] font-black tracking-tighter text-zinc-900 leading-tight mb-3 uppercase">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-1 text-[#FFC633]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    fill={i + 1 <= avgRating ? "currentColor" : (i + 0.5 <= avgRating ? "url(#half-grad)" : "transparent")} 
                    color={i + 1 <= Math.ceil(avgRating) ? "currentColor" : "#D4D4D8"} 
                    size={20} 
                  />
                ))}
                {/* SVG gradient para media estrella si es necesario */}
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="half-grad">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-sm text-zinc-900">{avgRating.toFixed(1)}/5 <span className="text-zinc-500">({reviewsList.length} reseñas)</span></span>
            </div>
            
            <ProductPurchaseSection 
              product={product} 
              initialCurrentPrice={currentPrice} 
              initialOriginalPrice={originalPrice} 
              initialHasDiscount={hasDiscount} 
              initialDiscountPercent={discountPercent} 
            />
            
            <p className="text-zinc-500 mb-6 leading-relaxed pb-6 border-b border-zinc-200">
              {product.description || 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.'}
            </p>

            {/* TABLA NUTRICIONAL PARA SUPLEMENTOS */}
            {product.type === 'SUPPLEMENT' && suppInfo && (
              <div className="mb-6 bg-zinc-50 border border-zinc-200 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Información Nutricional
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  {suppInfo.flavor && (
                    <>
                      <dt className="text-zinc-500">Sabor</dt>
                      <dd className="font-medium text-zinc-900">{suppInfo.flavor}</dd>
                    </>
                  )}
                  {suppInfo.servings && (
                    <>
                      <dt className="text-zinc-500">Servicios</dt>
                      <dd className="font-medium text-zinc-900">{suppInfo.servings}</dd>
                    </>
                  )}
                  {suppInfo.net_weight && (
                    <>
                      <dt className="text-zinc-500">Peso Neto</dt>
                      <dd className="font-medium text-zinc-900">{suppInfo.net_weight} g</dd>
                    </>
                  )}
                  {suppInfo.grams && (
                    <>
                      <dt className="text-zinc-500">Tamaño de porción</dt>
                      <dd className="font-medium text-zinc-900">{suppInfo.grams} g</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Tabs & Reviews Section */}
        <div className="mt-20">
          <div className="flex border-b border-zinc-200 mb-8">
            <button className="flex-1 pb-4 text-center text-zinc-900 font-medium border-b-2 border-zinc-900">
              Reseñas
            </button>
          </div>
          
          <ProductReviews productId={product.id} reviews={reviewsList as any} user={user} />
        </div>
      </div>
    </div>
  );
}
