import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Metadata } from 'next';
import { Star, Tag } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { ProductReviews } from '@/components/ProductReviews';
import { ProductGallery } from './ProductGallery';
import { ProductPurchaseSection } from './ProductPurchaseSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('title, description, image').eq('id', resolvedParams.id).maybeSingle();

  const title = product ? product.title : 'Producto no encontrado';
  const description = product?.description || 'Detalles del producto en KLONFARK';
  const image = product?.image || '';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | KLONFARK`,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | KLONFARK`,
      description,
      images: image ? [image] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  let product: any = null;
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('*, brands(*), categories(*), supplement_information(*), product_images(*), product_variants(*)')
    .eq('id', resolvedParams.id)
    .maybeSingle();

  if (productData) {
    product = productData;
  } else if (!productError) {
    notFound();
  } else {
    console.error("Error al consultar producto con relaciones, ejecutando fallback:", productError);
    const { data: baseProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', resolvedParams.id)
      .maybeSingle();

    if (!baseProduct) {
      notFound();
    }

    const [brandsRes, suppRes, imagesRes, variantsRes] = await Promise.all([
      baseProduct.brand_id ? supabase.from('brands').select('*').eq('id', baseProduct.brand_id).maybeSingle() : Promise.resolve({ data: null }),
      baseProduct.type === 'SUPPLEMENT' ? supabase.from('supplement_information').select('*').eq('product_id', baseProduct.id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('product_images').select('*').eq('product_id', baseProduct.id).order('order', { ascending: true }),
      supabase.from('product_variants').select('*').eq('product_id', baseProduct.id)
    ]);

    product = {
      ...baseProduct,
      brands: brandsRes.data || null,
      supplement_information: suppRes.data || null,
      product_images: imagesRes.data || [],
      product_variants: variantsRes.data || []
    };
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
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center text-sm text-zinc-400 gap-2">
          <Link href="/" className="hover:text-zinc-100 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-zinc-100 transition-colors">Shop</Link>
          <span>&gt;</span>
          <Link href={`/shop?category_name=${product.categories?.name?.toLowerCase() || ''}`} className="hover:text-zinc-100 capitalize transition-colors">
            {product.categories?.name || 'General'}
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-zinc-100 truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left: Images */}
          <ProductGallery images={allImages} title={product.title} />

          {/* Right: Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="text-3xl lg:text-[40px] font-black tracking-tighter text-zinc-900 dark-title leading-tight mb-3 uppercase">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-1 text-[#FFC633]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    fill={i + 1 <= avgRating ? "currentColor" : (i + 0.5 <= avgRating ? "url(#half-grad)" : "transparent")} 
                    color={i + 1 <= Math.ceil(avgRating) ? "currentColor" : "#71717a"} 
                    size={20} 
                  />
                ))}
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="half-grad">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-300">
                {avgRating.toFixed(1)}/5 <span className="text-zinc-400 font-normal">({reviewsList.length} reseñas)</span>
              </span>
            </div>
            
            <ProductPurchaseSection 
              product={product} 
              initialCurrentPrice={currentPrice} 
              initialOriginalPrice={originalPrice} 
              initialHasDiscount={hasDiscount} 
              initialDiscountPercent={discountPercent} 
            />
            
            <p className="text-zinc-300 mb-6 leading-relaxed pb-6 border-b border-zinc-200/20">
              {product.description || 'Producto de alta calidad seleccionado especialmente para acompañar tu rendimiento y estilo.'}
            </p>

            {/* TABLA NUTRICIONAL PARA SUPLEMENTOS */}
            {product.type === 'SUPPLEMENT' && suppInfo && (
              <div className="mb-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-100 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  Información Nutricional
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  {suppInfo.flavor && (
                    <>
                      <dt className="text-zinc-400">Sabor</dt>
                      <dd className="font-semibold text-zinc-100">{suppInfo.flavor}</dd>
                    </>
                  )}
                  {suppInfo.servings && (
                    <>
                      <dt className="text-zinc-400">Servicios</dt>
                      <dd className="font-semibold text-zinc-100">{suppInfo.servings}</dd>
                    </>
                  )}
                  {suppInfo.net_weight && (
                    <>
                      <dt className="text-zinc-400">Peso Neto</dt>
                      <dd className="font-semibold text-zinc-100">{suppInfo.net_weight} g</dd>
                    </>
                  )}
                  {suppInfo.grams && (
                    <>
                      <dt className="text-zinc-400">Porción</dt>
                      <dd className="font-semibold text-zinc-100">{suppInfo.grams} g</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Tabs & Reviews Section */}
        <div className="mt-20">
          <div className="flex border-b border-zinc-200/20 mb-8">
            <button className="flex-1 pb-4 text-center text-zinc-100 font-bold border-b-2 border-zinc-100">
              Reseñas y Opiniones
            </button>
          </div>
          
          <ProductReviews productId={product.id} reviews={reviewsList as any} user={user} />
        </div>
      </div>
    </div>
  );
}
