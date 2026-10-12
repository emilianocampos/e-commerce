import { createAdminClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ShippingStatusSelect } from '@/app/admin/ventas/ShippingStatusSelect';
import { OrderStatusSelect } from '@/app/admin/ventas/OrderStatusSelect';
import { SyncPaymentButton } from './SyncPaymentButton';
import { syncOrderPaymentStatus } from '@/actions/orders';
import { ArrowLeft, MessageCircle, ExternalLink, Package, User, Mail, Phone, MapPin, CreditCard, Truck } from 'lucide-react';

export const metadata = {
  title: 'Detalle de Pedido | Panel de Administración',
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const resolvedParams = await params;
  const orderId = resolvedParams.id;
  const adminClient = createAdminClient();

  // Traer la orden con sus items (incluyendo el producto vinculado) y el perfil del cliente
  const { data: order, error } = await adminClient
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          id,
          title,
          image,
          price,
          category
        )
      ),
      profiles (*)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  // Si la orden está 'pending', sincronizar en tiempo real con Mercado Pago
  // Si el cliente pagó -> pasa a Aprobado. Si nunca acreditó el dinero o abandonó -> pasa a Cancelado.
  let currentStatus = order.status || 'pending';
  if (currentStatus === 'pending') {
    try {
      const syncResult = await syncOrderPaymentStatus(order.id);
      if (syncResult?.status && syncResult.status !== currentStatus) {
        currentStatus = syncResult.status;
        order.status = syncResult.status;
      }
    } catch (e) {
      console.error('Error sincronizando estado de orden con MP:', e);
    }
  }

  // Resolver perfil del cliente con tolerancia a estructuras de respuesta y fallback
  let client = (Array.isArray(order.profiles) ? order.profiles[0] : order.profiles) || null;

  if (!client && order.profile_id) {
    const { data: directProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', order.profile_id)
      .maybeSingle();
    if (directProfile) {
      client = directProfile;
    }
  }

  // Si aún faltan datos de email o nombre, consultar Auth Admin de Supabase
  if (order.profile_id && (!client?.email || !client?.full_name)) {
    try {
      const { data: authUser } = await adminClient.auth.admin.getUserById(order.profile_id);
      if (authUser?.user) {
        client = {
          ...client,
          email: client?.email || authUser.user.email || '',
          full_name: client?.full_name || authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || '',
          phone: client?.phone || client?.telefono || (authUser.user.user_metadata?.phone as string) || authUser.user.phone || '',
        };
      }
    } catch (e) {
      // Ignorar fallback de auth admin
    }
  }

  client = client || {};

  // Si algún item no cargó su producto por la relación directa, recuperarlo manualmente por product_id
  if (order.order_items && order.order_items.length > 0) {
    for (const item of order.order_items) {
      if (!item.product && item.product_id) {
        const { data: prod } = await adminClient
          .from('products')
          .select('id, title, image, price, category')
          .eq('id', item.product_id)
          .maybeSingle();
        if (prod) {
          item.product = prod;
        }
      }
    }
  }

  const clientFullName = client.full_name || `${client.nombre || ''} ${client.apellido || ''}`.trim() || client.email || 'Cliente sin nombre';
  const clientPhone = client.phone || client.telefono || '';
  const cleanPhoneDigits = clientPhone.replace(/\D/g, '');
  const clientAddress = client.address || client.direccion || [client.calle, client.numero, client.piso ? `Piso ${client.piso}` : '', client.departamento ? `Dpto ${client.departamento}` : ''].filter(Boolean).join(' ') || 'No provisto';
  const clientLocation = [
    client.city || client.ciudad || client.localidad,
    client.provincia,
    (client.postal_code || client.codigo_postal) ? `CP: ${client.postal_code || client.codigo_postal}` : ''
  ].filter(Boolean).join(', ') || 'No provisto';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/pedidos" 
              className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="Volver a Pedidos"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              Detalle de Pedido
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 pl-11 font-mono">
            ID: {order.id}
          </p>
        </div>

        <Link href="/admin/pedidos" className="text-sm text-blue-600 hover:underline font-medium hidden sm:inline-block">
          &larr; Volver a la lista
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Datos del Cliente */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">Datos del Cliente</h2>
          </div>

          <dl className="space-y-3.5 text-sm">
            <div>
              <dt className="text-zinc-500 text-xs">Nombre Completo</dt>
              <dd className="font-semibold text-zinc-900 text-base">{clientFullName}</dd>
            </div>

            <div>
              <dt className="text-zinc-500 text-xs">Email</dt>
              <dd className="text-zinc-900 font-medium">
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                ) : 'No provisto'}
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 text-xs">DNI / Identificación</dt>
              <dd className="text-zinc-900 font-mono">{client.dni || 'No provisto'}</dd>
            </div>

            <div>
              <dt className="text-zinc-500 text-xs">Teléfono / WhatsApp</dt>
              <dd className="text-zinc-900 font-medium mt-0.5">
                {clientPhone ? (
                  <div className="space-y-1.5">
                    <div>{clientPhone}</div>
                    {cleanPhoneDigits.length >= 6 && (
                      <a
                        href={`https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(`¡Hola ${clientFullName}! Te contactamos de la tienda por tu pedido #${order.id.split('-')[0].toUpperCase()}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <MessageCircle size={14} className="text-emerald-600" />
                        Chatear por WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-zinc-400">No provisto</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 text-xs">Dirección de Entrega</dt>
              <dd className="text-zinc-900">{clientAddress}</dd>
            </div>

            <div>
              <dt className="text-zinc-500 text-xs">Ciudad / Provincia / CP</dt>
              <dd className="text-zinc-900">{clientLocation}</dd>
            </div>

            {(client.referencias || client.observaciones || order.notes) && (
              <div>
                <dt className="text-zinc-500 text-xs">Notas / Referencias</dt>
                <dd className="text-zinc-700 bg-zinc-50 p-2 rounded-lg text-xs italic">
                  {client.referencias || client.observaciones || order.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Información del Pago */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">Información del Pago</h2>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <dt className="text-zinc-500">Estado Compra</dt>
              <dd>
                <OrderStatusSelect orderId={order.id} initialStatus={currentStatus} />
              </dd>
            </div>

            {/* Badge Automático de Estado de Mercado Pago */}
            <div className="pt-1">
              <SyncPaymentButton orderId={order.id} status={currentStatus} />
            </div>

            <div className="flex justify-between items-center pt-2">
              <dt className="text-zinc-500">Fecha de Creación</dt>
              <dd className="text-zinc-900 font-medium text-right text-xs">
                {new Date(order.created_at).toLocaleString('es-AR')}
              </dd>
            </div>

            <div className="flex justify-between items-center">
              <dt className="text-zinc-500">Última Actualización</dt>
              <dd className="text-zinc-900 font-medium text-right text-xs">
                {new Date(order.updated_at || order.created_at).toLocaleString('es-AR')}
              </dd>
            </div>

            {order.vip_card_code && (
              <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <dt className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  👑 Tarjeta VIP Aplicada
                </dt>
                <dd className="font-mono text-xs font-black text-amber-900">{order.vip_card_code}</dd>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-zinc-100">
              <dt className="text-zinc-500 text-xs mb-1">ID Orden (Interno)</dt>
              <dd className="font-mono text-xs text-zinc-900 break-all bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                {order.id}
              </dd>
            </div>

            <div>
              <dt className="text-zinc-500 text-xs mb-1">Payment ID (Mercado Pago)</dt>
              <dd className="font-mono text-xs text-zinc-900 break-all bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                {order.mp_payment_id || order.payment_id || 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Estado Envío */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
              <Truck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-zinc-900">Estado de Envío</h2>
            </div>

            <div className="mt-3">
              <label className="text-xs text-zinc-500 block mb-1.5 font-medium">Estado logístico actual</label>
              <ShippingStatusSelect orderId={order.id} initialStatus={order.shipping_status || 'pending'} />
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl mt-4 admin-info-box flex items-start gap-2.5 shadow-xs">
            <span className="text-base shrink-0 leading-none select-none">🔔</span>
            <span className="text-xs text-blue-800 font-medium leading-relaxed keep-text-color">
              Al modificar este estado, el cliente recibirá automáticamente una notificación en su panel de pedidos.
            </span>
          </div>
        </div>

        {/* Productos en el Pedido */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-zinc-900">Productos en el Pedido ({order.order_items?.length || 0})</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="border-b border-zinc-200 text-zinc-900 bg-zinc-50/50">
                <tr>
                  <th className="py-3 px-3 font-semibold">Producto</th>
                  <th className="py-3 px-3 font-semibold text-center">Cantidad</th>
                  <th className="py-3 px-3 font-semibold text-right">Precio Unitario</th>
                  <th className="py-3 px-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {order.order_items?.map((item: any) => {
                  const productTitle = item.product?.title || item.product_title || 'Producto';
                  const productImage = item.product?.image || null;
                  const itemPrice = Number(item.unit_price || item.price || item.product?.price || 0);
                  const itemSubtotal = itemPrice * item.quantity;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {productImage ? (
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                              <img
                                src={productImage}
                                alt={productTitle}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-400">
                              <Package size={20} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 text-sm leading-snug">
                              {productTitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {item.selected_size && item.selected_size !== 'Único' && item.selected_size.trim() !== '' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  Talle: {item.selected_size}
                                </span>
                              )}
                              {item.selected_color && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  Color: {item.selected_color}
                                </span>
                              )}
                              {item.product_id && (
                                <Link
                                  href={`/producto/${item.product_id}`}
                                  target="_blank"
                                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1"
                                >
                                  Ver en tienda <ExternalLink size={10} />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-zinc-800">{item.quantity}</td>
                      <td className="py-4 px-3 text-right font-medium text-zinc-700">{formatCurrency(itemPrice)}</td>
                      <td className="py-4 px-3 text-right font-bold text-zinc-900">{formatCurrency(itemSubtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-zinc-200 font-bold text-zinc-900 text-sm">
                {order.subtotal_amount && Number(order.subtotal_amount) > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-3 text-right text-zinc-500 font-normal">Subtotal Original:</td>
                    <td className="pt-3 text-right text-zinc-900">{formatCurrency(order.subtotal_amount)}</td>
                  </tr>
                )}
                {order.promo_discount_amount && Number(order.promo_discount_amount) > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-2 text-right font-normal">
                      <span className="text-emerald-500 font-medium">Descuento Transferencia:</span>
                    </td>
                    <td className="pt-2 text-right">
                      <span className="text-emerald-500 font-bold">-{formatCurrency(order.promo_discount_amount)}</span>
                    </td>
                  </tr>
                )}
                {order.vip_discount_amount && Number(order.vip_discount_amount) > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-2 text-right font-normal">
                      <span className="text-amber-500 font-medium">Beneficio VIP ({order.vip_card_code || 'VIP'}):</span>
                    </td>
                    <td className="pt-2 text-right">
                      <span className="text-amber-500 font-bold">-{formatCurrency(order.vip_discount_amount)}</span>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="pt-4 text-right text-base font-bold">
                    <span>Total Pagado:</span>
                  </td>
                  <td className="pt-4 text-right">
                    <span className="text-xl font-extrabold text-emerald-500">{formatCurrency(order.total_amount || order.total || 0)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

