'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Tag, ArrowRight, Crown, Check, X, Sparkles, HelpCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CheckoutButton } from './CheckoutButton';
import { validateVipCard } from '@/actions/vip';
import { showToast } from 'nextjs-toast-notify';
import styles from './Cart.module.css';

export function Cart() {
  const { items, removeItem, increaseQuantity, decreaseQuantity } = useCartStore();

  // VIP Card State
  const [vipInput, setVipInput] = useState('');
  const [isValidatingVip, setIsValidatingVip] = useState(false);
  const [appliedVipCard, setAppliedVipCard] = useState<{
    id: string;
    cardNumber: string;
    clientName: string;
    discountPercentage: number;
  } | null>(null);

  // Transfer Promo State (10% descuento por transferencia)
  const [isTransferPromo, setIsTransferPromo] = useState(true);

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Inicio</Link> &gt; <span>Carrito</span>
        </div>
        <h1 className={styles.title}>TU CARRITO</h1>
        <div style={{ textAlign: 'center', padding: '64px', border: '1px solid #E5E5E5', borderRadius: '20px' }}>
          <p style={{ fontSize: '20px', color: 'var(--shop-gray-dark)' }}>Tu carrito está vacío.</p>
          <Link href="/shop" style={{ display: 'inline-block', marginTop: '24px', backgroundColor: 'var(--shop-black)', color: 'white', padding: '16px 32px', borderRadius: '62px', textDecoration: 'none' }}>
            Explorar catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Handle VIP validation
  const handleApplyVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipInput.trim()) return;

    setIsValidatingVip(true);
    try {
      const res = await validateVipCard(vipInput);
      if (res.valid && res.card) {
        setAppliedVipCard(res.card);
        showToast.success(`¡Tarjeta VIP ${res.card.cardNumber} validada! (${res.card.clientName})`, { position: 'top-center' });
        setVipInput('');
      } else {
        showToast.error(res.error || 'Código VIP inválido o tarjeta inactiva', { position: 'top-center' });
      }
    } catch (err: any) {
      showToast.error('Error al validar tarjeta VIP', { position: 'top-center' });
    } finally {
      setIsValidatingVip(false);
    }
  };

  const handleRemoveVip = () => {
    setAppliedVipCard(null);
    showToast.info('Tarjeta VIP removida', { position: 'top-center' });
  };

  // Calculations per item and totals
  let subtotalAmount = 0;
  let promoDiscountAmount = 0;
  let vipDiscountAmount = 0;

  const promoRate = isTransferPromo ? 0.10 : 0.0;

  const calculatedItems = items.map((item) => {
    const qty = item.quantity;
    const basePrice = item.product.price;
    const itemSubtotal = basePrice * qty;
    subtotalAmount += itemSubtotal;

    // 1. Promo transferencia
    const itemPromoDiscount = itemSubtotal * promoRate;
    promoDiscountAmount += itemPromoDiscount;
    const priceAfterPromo = itemSubtotal - itemPromoDiscount;

    // 2. Beneficio VIP
    let itemVipDiscount = 0;
    let itemVipRate = 0;
    let isVipExcluded = false;

    if (appliedVipCard) {
      const productVip = item.product.vip_discount_percentage !== null && item.product.vip_discount_percentage !== undefined
        ? Number(item.product.vip_discount_percentage)
        : appliedVipCard.discountPercentage;

      const isStackable = item.product.vip_stackable !== false;

      if (productVip === 0) {
        isVipExcluded = true;
      } else if (!isStackable && promoRate > 0) {
        isVipExcluded = true; // No acumulable si ya tiene promo
      } else {
        itemVipRate = productVip / 100;
        itemVipDiscount = priceAfterPromo * itemVipRate;
        vipDiscountAmount += itemVipDiscount;
      }
    }

    const itemFinalTotal = priceAfterPromo - itemVipDiscount;

    return {
      ...item,
      itemSubtotal,
      itemPromoDiscount,
      itemVipDiscount,
      itemVipRate,
      isVipExcluded,
      itemFinalTotal,
    };
  });

  const totalAmount = subtotalAmount - promoDiscountAmount - vipDiscountAmount;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Inicio</Link> &gt; <span>Carrito</span>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className={styles.title}>TU CARRITO</h1>
        {appliedVipCard && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-300 px-4 py-2 rounded-2xl">
            <Crown className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                Cliente VIP Klonfark: {appliedVipCard.clientName}
              </span>
              <span className="text-[11px] text-amber-700">Tarjeta #{appliedVipCard.cardNumber}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.grid}>
        {/* Left Column: Items */}
        <div className={styles.itemsBox}>
          {calculatedItems.map((item) => (
            <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || ''}`} className={styles.itemRow}>
              <div className={styles.itemImage}>
                {item.product.image && (
                  <Image src={item.product.image} alt={item.product.title} fill unoptimized className="object-cover" />
                )}
              </div>
              
              <div className={styles.itemInfo}>
                <div>
                  <h3 className={styles.itemTitle}>{item.product.title}</h3>
                  {item.product.type === 'SUPPLEMENT' ? (
                    item.product.supplement_information?.flavor && (
                      <p className={styles.itemDetail}>Sabor: <span>{item.product.supplement_information.flavor}</span></p>
                    )
                  ) : (
                    <>
                      {item.selectedSize && item.selectedSize !== 'Único' && item.selectedSize.trim() !== '' && (
                        <p className={styles.itemDetail}>Talle: <span>{item.selectedSize}</span></p>
                      )}
                      {item.selectedColor && <p className={styles.itemDetail}>Color: <span>{item.selectedColor}</span></p>}
                    </>
                  )}

                  {/* VIP Badges for this product */}
                  {appliedVipCard && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.itemVipDiscount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                          <Crown className="w-3 h-3 text-amber-600" />
                          Beneficio VIP: {Math.round(item.itemVipRate * 100)}% OFF (-{formatCurrency(item.itemVipDiscount)})
                        </span>
                      ) : item.isVipExcluded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-md">
                          {item.product.vip_discount_percentage === 0 ? 'Sin beneficio VIP' : 'VIP no acumulable con promo'}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
                
                <button
                  className={styles.deleteBtn}
                  onClick={() => {
                    removeItem(item.product.id, item.selectedSize, item.selectedColor);
                    showToast.error('Producto eliminado', { position: 'top-center', duration: 3000 });
                  }}
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={24} />
                </button>
                
                <div className={styles.itemBottom}>
                  <div>
                    <p className={styles.itemPrice}>{formatCurrency(item.product.price)}</p>
                    {(item.itemPromoDiscount > 0 || item.itemVipDiscount > 0) && (
                      <span className="text-xs font-bold text-emerald-600">
                        Final x unidad: {formatCurrency(item.itemFinalTotal / item.quantity)}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => decreaseQuantity(item.product.id, item.selectedSize, item.selectedColor)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <span className={styles.quantityValue}>{item.quantity}</span>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => increaseQuantity(item.product.id, item.selectedSize, item.selectedColor)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryBox}>
          <h2 className={styles.summaryTitle}>Resumen de la compra</h2>

          {/* TRANSFER PROMO TOGGLE */}
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransferPromo}
                onChange={(e) => setIsTransferPromo(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-extrabold text-emerald-950 block">
                  💸 Promo Transferencia / Efectivo (-10% OFF)
                </span>
                <span className="text-emerald-700 block mt-0.5">
                  Aplica automáticamente un 10% de descuento directo sobre tus productos.
                </span>
              </div>
            </label>
          </div>

          {/* VIP CARD INPUT / ACTIVE CARD */}
          <div className="mb-5">
            {!appliedVipCard ? (
              <form onSubmit={handleApplyVip} className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  ¿Tenés Tarjeta VIP Klonfark?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Ingresar número de tarjeta (ej. VIP-1001)"
                      value={vipInput}
                      onChange={(e) => setVipInput(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-900 placeholder:font-sans placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isValidatingVip || !vipInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isValidatingVip ? 'Validando...' : 'Aplicar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Tarjeta VIP #{appliedVipCard.cardNumber}
                    </span>
                    <span className="text-[11px] text-amber-700 block">
                      Beneficio activo para {appliedVipCard.clientName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveVip}
                  className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-100 hover:text-amber-950 transition-colors"
                  title="Quitar tarjeta VIP"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* DETAILED SUMMARY BREAKDOWN */}
          <div className="space-y-3 pt-2 text-sm border-t border-zinc-100">
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Precio</span>
              <span className={styles.summaryValue}>{formatCurrency(subtotalAmount)}</span>
            </div>

            {promoDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>Promo transferencia (-10%)</span>
                <span>-{formatCurrency(promoDiscountAmount)}</span>
              </div>
            )}

            {vipDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-amber-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Beneficio VIP
                </span>
                <span>-{formatCurrency(vipDiscountAmount)}</span>
              </div>
            )}
          </div>
          
          <hr className={styles.summaryDivider} />
          
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>{formatCurrency(totalAmount)}</span>
          </div>

          <CheckoutButton 
            vipCardCode={appliedVipCard?.cardNumber}
            isTransferPromo={isTransferPromo}
          />
        </div>
      </div>
    </div>
  );
}
