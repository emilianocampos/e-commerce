import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/site-url';

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanText(text: string): string {
  return (text || '')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes cache for Google Merchant crawler

export async function GET(request: NextRequest) {
  const baseUrl = getSiteUrl();
  const format = request.nextUrl.searchParams.get('format')?.toLowerCase();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from('products')
      .select('*, brands(name), product_images(url, order)')
      .neq('active', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const validProducts = products || [];

    // Formato TXT / TSV (Tab Separated Values) compatible con Google Merchant Center
    if (format === 'txt' || format === 'tsv') {
      const headers = [
        'id',
        'title',
        'description',
        'link',
        'image_link',
        'additional_image_link',
        'availability',
        'price',
        'sale_price',
        'brand',
        'condition',
        'gtin',
        'mpn',
        'identifier_exists',
        'google_product_category',
        'product_type',
      ];

      const rows = validProducts.map((p) => {
        const id = p.id;
        const title = cleanText(p.title || 'Producto KLONFARK').slice(0, 150);
        const description = cleanText(p.description || p.title || 'Producto oficial KLONFARK').slice(0, 5000);
        const link = `${baseUrl}/producto/${p.id}`;
        const imageLink = p.image || `${baseUrl}/logo.png`;
        
        let additionalImages = '';
        if (p.product_images && Array.isArray(p.product_images)) {
          additionalImages = p.product_images
            .sort((a: any, b: any) => a.order - b.order)
            .filter((img: any) => img.url && img.url !== p.image)
            .map((img: any) => img.url)
            .slice(0, 10)
            .join(',');
        }

        const availability = (p.stock > 0 && p.active !== false) ? 'in_stock' : 'out_of_stock';
        const price = `${Number(p.price).toFixed(2)} ARS`;
        const salePrice = p.sale_price && Number(p.sale_price) < Number(p.price)
          ? `${Number(p.sale_price).toFixed(2)} ARS`
          : '';
        const brand = p.brands?.name || 'KLONFARK';
        const condition = 'new';
        const gtin = p.barcode || '';
        const mpn = p.sku || p.id;
        const identifierExists = p.barcode ? 'yes' : 'no';

        const category = p.type === 'SUPPLEMENT' || p.type === 'COMBO'
          ? 'Health & Beauty > Health Care > Fitness & Nutrition'
          : 'Apparel & Accessories > Clothing';

        const productType = p.type === 'SUPPLEMENT'
          ? 'Suplementos'
          : p.type === 'COMBO'
          ? 'Combos y Packs'
          : 'Indumentaria Deportiva';

        const escapeTsv = (val: string) => (val || '').replace(/[\t\r\n]+/g, ' ').trim();

        return [
          escapeTsv(id),
          escapeTsv(title),
          escapeTsv(description),
          escapeTsv(link),
          escapeTsv(imageLink),
          escapeTsv(additionalImages),
          availability,
          price,
          salePrice,
          escapeTsv(brand),
          condition,
          escapeTsv(gtin),
          escapeTsv(mpn),
          identifierExists,
          category,
          productType,
        ].join('\t');
      });

      const tsvContent = [headers.join('\t'), ...rows].join('\n');

      return new NextResponse(tsvContent, {
        headers: {
          'Content-Type': 'text/tab-separated-values; charset=utf-8',
          'Content-Disposition': 'inline; filename="google-merchant-products.tsv"',
          'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
        },
      });
    }

    // Formato Estándar Oficial RSS 2.0 XML para Google Merchant Center
    const itemsXml = validProducts.map((product) => {
      const productUrl = `${baseUrl}/producto/${product.id}`;
      const title = escapeXml(cleanText(product.title || 'Producto KLONFARK').slice(0, 150));
      const description = escapeXml(
        cleanText(product.description || product.title || 'Producto de alta calidad KLONFARK').slice(0, 5000)
      );
      const imageUrl = product.image || `${baseUrl}/logo.png`;
      const brandName = escapeXml(product.brands?.name || 'KLONFARK');
      const availability = (product.stock > 0 && product.active !== false) ? 'in_stock' : 'out_of_stock';

      const regularPrice = Number(product.price).toFixed(2);
      const salePrice = product.sale_price ? Number(product.sale_price).toFixed(2) : null;

      const category = product.type === 'SUPPLEMENT' || product.type === 'COMBO'
        ? 'Health &amp; Beauty &gt; Health Care &gt; Fitness &amp; Nutrition'
        : 'Apparel &amp; Accessories &gt; Clothing';

      const productType = product.type === 'SUPPLEMENT'
        ? 'Suplementos'
        : product.type === 'COMBO'
        ? 'Combos'
        : 'Indumentaria';

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

      const hasBarcode = Boolean(product.barcode);
      const gtinTag = hasBarcode ? `\n        <g:gtin>${escapeXml(product.barcode)}</g:gtin>` : '';
      const mpnTag = `\n        <g:mpn>${escapeXml(product.sku || product.id)}</g:mpn>`;
      const identifierExistsTag = `\n        <g:identifier_exists>${hasBarcode ? 'yes' : 'no'}</g:identifier_exists>`;

      return `    <item>
        <g:id>${product.id}</g:id>
        <g:title>${title}</g:title>
        <g:description>${description}</g:description>
        <g:link>${escapeXml(productUrl)}</g:link>
        <g:image_link>${escapeXml(imageUrl)}</g:image_link>${additionalImagesXml}
        <g:availability>${availability}</g:availability>
        <g:price>${regularPrice} ARS</g:price>${salePrice && Number(salePrice) < Number(regularPrice) ? `\n        <g:sale_price>${salePrice} ARS</g:sale_price>` : ''}
        <g:brand>${brandName}</g:brand>
        <g:condition>new</g:condition>${gtinTag}${mpnTag}${identifierExistsTag}
        <g:google_product_category>${category}</g:google_product_category>
        <g:product_type>${escapeXml(productType)}</g:product_type>
        <g:shipping>
          <g:country>AR</g:country>
          <g:service>Correo Argentino</g:service>
          <g:price>0.00 ARS</g:price>
        </g:shipping>
      </item>`;
    }).join('\n');

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>KLONFARK - Catálogo Oficial de Productos</title>
    <link>${baseUrl}</link>
    <description>Feed XML dinámico oficial para Google Merchant Center y Google Shopping</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(feedXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
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
