import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate every hour

export async function GET() {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://klonfark.com';
  const baseUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: products, error } = await supabase
      .from('products')
      .select('*, brands(name), product_images(url, order)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const itemsXml = (products || []).map((product) => {
      const productUrl = `${baseUrl}/producto/${product.id}`;
      const title = escapeXml(product.title || 'Producto KLONFARK');
      const description = escapeXml(
        (product.description || product.title || 'Producto de alta calidad KLONFARK')
          .replace(/<[^>]*>?/gm, '')
          .slice(0, 5000)
      );
      const imageUrl = product.image || `${baseUrl}/logo.png`;
      const brandName = escapeXml(product.brands?.name || 'KLONFARK');
      const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
      
      const regularPrice = Number(product.price).toFixed(2);
      const salePrice = product.sale_price ? Number(product.sale_price).toFixed(2) : null;

      const category = product.type === 'SUPPLEMENT'
        ? 'Health &amp; Beauty &gt; Health Care &gt; Fitness &amp; Nutrition'
        : 'Apparel &amp; Accessories &gt; Clothing';

      let additionalImagesXml = '';
      if (product.product_images && Array.isArray(product.product_images)) {
        product.product_images
          .sort((a: any, b: any) => a.order - b.order)
          .forEach((img: any) => {
            if (img.url && img.url !== product.image) {
              additionalImagesXml += `\n        <g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`;
            }
          });
      }

      return `    <item>
        <g:id>${product.id}</g:id>
        <g:title>${title}</g:title>
        <g:description>${description}</g:description>
        <g:link>${escapeXml(productUrl)}</g:link>
        <g:image_link>${escapeXml(imageUrl)}</g:image_link>${additionalImagesXml}
        <g:availability>${availability}</g:availability>
        <g:price>${regularPrice} ARS</g:price>
        ${salePrice && Number(salePrice) < Number(regularPrice) ? `<g:sale_price>${salePrice} ARS</g:sale_price>` : ''}
        <g:brand>${brandName}</g:brand>
        <g:condition>new</g:condition>
        <g:google_product_category>${category}</g:google_product_category>
      </item>`;
    }).join('\n');

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>KLONFARK - Catálogo de Productos</title>
    <link>${baseUrl}</link>
    <description>Feed XML oficial de productos para Google Merchant Center y Google Shopping</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(feedXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Error generating Google Merchant Feed:', err);
    return new NextResponse(`<error>Error generating feed: ${escapeXml(err.message || 'Unknown')}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
