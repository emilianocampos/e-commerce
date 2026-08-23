'use client';

import { useState } from 'react';
import { VipCard } from '@/types/vip';
import { createVipCard, updateVipCard, toggleVipCardStatus, deleteVipCard } from '@/actions/vip';
import { 
  Crown, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Power, 
  Mail, 
  Phone, 
  User, 
  Percent, 
  Sparkles, 
  ShieldCheck,
  X,
  CreditCard,
  FileText
} from 'lucide-react';
import { showToast } from 'nextjs-toast-notify';

interface VipCardsManagerProps {
  initialCards: VipCard[];
}

export function VipCardsManager({ initialCards }: VipCardsManagerProps) {
  const [cards, setCards] = useState<VipCard[]>(initialCards);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<VipCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('10');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingCard(null);
    const randomCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    setCardNumber(randomCode);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setDiscountPercentage('10');
    setActive(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (card: VipCard) => {
    setEditingCard(card);
    setCardNumber(card.card_number);
    setClientName(card.client_name);
    setClientEmail(card.client_email || '');
    setClientPhone(card.client_phone || '');
    setDiscountPercentage(String(card.discount_percentage));
    setActive(card.active);
    setNotes(card.notes || '');
    setIsModalOpen(true);
  };

  const handleGenerateRandomNumber = () => {
    const randomCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    setCardNumber(randomCode);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast.success(`Código ${code} copiado al portapapeles`, { position: 'top-center', duration: 2500 });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleStatus = async (card: VipCard) => {
    const newStatus = !card.active;
    const res = await toggleVipCardStatus(card.id, newStatus);
    if (res.success) {
      setCards(cards.map(c => c.id === card.id ? { ...c, active: newStatus } : c));
      showToast.info(`Tarjeta ${card.card_number} ${newStatus ? 'activada' : 'pausada'}`, { position: 'top-center' });
    } else {
      showToast.error(res.error || 'Error al cambiar estado', { position: 'top-center' });
    }
  };

  const handleDelete = async (card: VipCard) => {
    if (!confirm(`¿Estás seguro de eliminar la tarjeta VIP ${card.card_number} de ${card.client_name}?`)) {
      return;
    }
    const res = await deleteVipCard(card.id);
    if (res.success) {
      setCards(cards.filter(c => c.id !== card.id));
      showToast.success('Tarjeta VIP eliminada', { position: 'top-center' });
    } else {
      showToast.error(res.error || 'Error al eliminar', { position: 'top-center' });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('card_number', cardNumber);
    formData.append('client_name', clientName);
    formData.append('client_email', clientEmail);
    formData.append('client_phone', clientPhone);
    formData.append('discount_percentage', discountPercentage);
    formData.append('active', active ? 'true' : 'false');
    formData.append('notes', notes);

    try {
      if (editingCard) {
        const res = await updateVipCard(editingCard.id, formData);
        if (res.error) {
          showToast.error(res.error, { position: 'top-center' });
        } else {
          setCards(cards.map(c => c.id === editingCard.id ? {
            ...c,
            card_number: cardNumber.toUpperCase(),
            client_name: clientName,
            client_email: clientEmail || null,
            client_phone: clientPhone || null,
            discount_percentage: Number(discountPercentage) || 10,
            active,
            notes: notes || null,
          } : c));
          showToast.success('Tarjeta VIP actualizada con éxito', { position: 'top-center' });
          setIsModalOpen(false);
        }
      } else {
        const res = await createVipCard(formData);
        if (res.error) {
          showToast.error(res.error, { position: 'top-center' });
        } else {
          if (res.card) {
            setCards([res.card, ...cards]);
          }
          showToast.success('¡Tarjeta VIP emitida con éxito!', { position: 'top-center' });
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      showToast.error(err.message || 'Error inesperado', { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.card_number.toLowerCase().includes(search.toLowerCase()) ||
      card.client_name.toLowerCase().includes(search.toLowerCase()) ||
      (card.client_email && card.client_email.toLowerCase().includes(search.toLowerCase())) ||
      (card.client_phone && card.client_phone.includes(search));

    if (!matchesSearch) return false;

    if (filterActive === 'active') return card.active;
    if (filterActive === 'inactive') return !card.active;
    return true;
  });

  const activeCount = cards.filter(c => c.active).length;

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            Club VIP Klonfark
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Emite y administra tarjetas VIP con números únicos y beneficios configurables.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold shadow-md hover:bg-zinc-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarjeta VIP
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Total Tarjetas</span>
            <span className="text-2xl font-extrabold text-zinc-900">{cards.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Tarjetas Activas</span>
            <span className="text-2xl font-extrabold text-emerald-600">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Beneficio Habitual</span>
            <span className="text-2xl font-extrabold text-purple-600">10% - 15%</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (ej. VIP-1001), cliente, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterActive === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Todas ({cards.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterActive === 'active' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Activas ({activeCount})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterActive === 'inactive' ? 'bg-zinc-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Pausadas ({cards.length - activeCount})
          </button>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredCards.map((card) => (
          <div 
            key={card.id} 
            className={`bg-white rounded-2xl p-4 border shadow-sm space-y-3 transition-all ${
              card.active ? 'border-zinc-200' : 'border-zinc-200 opacity-60 bg-zinc-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-zinc-900 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300">
                  {card.card_number}
                </span>
                <button
                  onClick={() => handleCopyCode(card.card_number)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-900"
                  title="Copiar código"
                >
                  {copiedCode === card.card_number ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {card.discount_percentage}% OFF
                </span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  card.active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {card.active ? 'Activa' : 'Pausada'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{card.client_name}</span>
              </div>
              {card.client_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{card.client_email}</span>
                </div>
              )}
              {card.client_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{card.client_phone}</span>
                </div>
              )}
              {card.notes && (
                <div className="flex items-center gap-2 text-zinc-400 italic">
                  <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{card.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs">
              <button
                onClick={() => handleToggleStatus(card)}
                className={`inline-flex items-center gap-1.5 font-semibold ${
                  card.active ? 'text-zinc-500 hover:text-zinc-700' : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {card.active ? 'Pausar' : 'Activar'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(card)}
                  className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(card)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCards.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-zinc-500 border border-zinc-200">
            No se encontraron tarjetas VIP registradas.
          </div>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Código Tarjeta</th>
                <th className="px-6 py-4 font-semibold">Cliente VIP</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold text-center">Descuento Base</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredCards.map((card) => (
                <tr 
                  key={card.id} 
                  className={`hover:bg-zinc-50 transition-colors ${!card.active ? 'opacity-60 bg-zinc-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                        {card.card_number}
                      </span>
                      <button
                        onClick={() => handleCopyCode(card.card_number)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
                        title="Copiar código"
                      >
                        {copiedCode === card.card_number ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{card.client_name}</div>
                    {card.notes && <div className="text-xs text-zinc-400">{card.notes}</div>}
                  </td>
                  <td className="px-6 py-4 text-xs space-y-0.5">
                    {card.client_email && (
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{card.client_email}</span>
                      </div>
                    )}
                    {card.client_phone && (
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{card.client_phone}</span>
                      </div>
                    )}
                    {!card.client_email && !card.client_phone && (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                      <Percent className="w-3 h-3" />
                      {card.discount_percentage}% OFF
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(card)}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer transition-all ${
                        card.active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                      title={card.active ? 'Clic para pausar' : 'Clic para activar'}
                    >
                      {card.active ? '● Activa' : '○ Pausada'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(card)}
                        className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(card)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCards.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No hay tarjetas VIP que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Crown className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">
                  {editingCard ? 'Editar Tarjeta VIP' : 'Emitir Nueva Tarjeta VIP'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Número / Código de Tarjeta VIP *
                  </label>
                  {!editingCard && (
                    <button
                      type="button"
                      onClick={handleGenerateRandomNumber}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
                    >
                      Generar aleatorio
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
                  placeholder="Ej: VIP-1024 o 849201"
                  className="w-full px-3.5 py-2.5 font-mono font-bold bg-amber-50/50 border border-amber-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">Este es el código que el cliente ingresará en el carrito.</p>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo del Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Teléfono (Opcional)
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej: 11 2345-6789"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Porcentaje Base de Descuento VIP
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['10', '15', '20'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercentage(pct)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        discountPercentage === pct
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {pct}% OFF
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="O ingresa un porcentaje personalizado"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">%</span>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <input
                  type="checkbox"
                  id="modal_active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="modal_active" className="text-xs font-semibold text-zinc-800 cursor-pointer">
                  {active ? 'Tarjeta activa y lista para usar' : 'Tarjeta pausada (no otorgará descuentos)'}
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Notas Internas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Cliente frecuente de la sucursal centro, referido por Juan..."
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold shadow-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : editingCard ? 'Actualizar Tarjeta' : 'Emitir Tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
