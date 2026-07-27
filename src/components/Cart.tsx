'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CheckoutButton } from './CheckoutButton';
import { showToast } from 'nextjs-toast-notify';
import styles from './Cart.module.css';

export function Cart() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, subtotal, total } = useCartStore();

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

  // Delivery fee from the mockup
  const deliveryFee = 15;
  const currentSubtotal = subtotal();
  const currentDiscount = currentSubtotal * 0.2; // -20% from mockup
  const currentTotal = currentSubtotal - currentDiscount + deliveryFee;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Inicio</Link> &gt; <span>Carrito</span>
      </div>
      
      <h1 className={styles.title}>TU CARRITO</h1>
      
      <div className={styles.grid}>
        {/* Left Column: Items */}
        <div className={styles.itemsBox}>
          {items.map((item) => (
            <div key={`${item.product.id}-${item.selectedSize}`} className={styles.itemRow}>
              <div className={styles.itemImage}>
                {item.product.image && (
                  <Image src={item.product.image} alt={item.product.title} fill unoptimized className="object-cover" />
                )}
              </div>
              
              <div className={styles.itemInfo}>
                <div>
                  <h3 className={styles.itemTitle}>{item.product.title}</h3>
                  <p className={styles.itemDetail}>Talle: <span>{item.selectedSize || 'L'}</span></p>
                  <p className={styles.itemDetail}>Color: <span>Blanco</span></p>
                  <p className={styles.itemPrice}>{formatCurrency(item.product.price)}</p>
                </div>
                
                <button
                  className={styles.deleteBtn}
                  onClick={() => {
                    removeItem(item.product.id, item.selectedSize);
                    showToast.error('Producto eliminado', { position: 'top-center', duration: 3000 });
                  }}
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={24} />
                </button>
                
                <div className={styles.quantityControl}>
                  <button
                    className={styles.quantityBtn}
                    onClick={() => decreaseQuantity(item.product.id, item.selectedSize)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <span className={styles.quantityValue}>{item.quantity}</span>
                  <button
                    className={styles.quantityBtn}
                    onClick={() => increaseQuantity(item.product.id, item.selectedSize)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryBox}>
          <h2 className={styles.summaryTitle}>Resumen de la compra</h2>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal</span>
            <span className={styles.summaryValue}>{formatCurrency(currentSubtotal)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Descuento (-20%)</span>
            <span className={styles.summaryValueRed}>-{formatCurrency(currentDiscount)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Envío</span>
            <span className={styles.summaryValue}>{formatCurrency(deliveryFee)}</span>
          </div>
          
          <hr className={styles.summaryDivider} />
          
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>{formatCurrency(currentTotal)}</span>
          </div>
          
          <div className={styles.promoCode}>
            <div className={styles.promoInputWrapper}>
              <Tag size={20} color="#999" />
              <input type="text" placeholder="Código de descuento" className={styles.promoInput} />
            </div>
            <button className={styles.promoBtn}>Aplicar</button>
          </div>
          
          <CheckoutButton />
        </div>
      </div>
    </div>
  );
}
