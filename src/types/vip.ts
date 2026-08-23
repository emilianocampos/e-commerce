export interface VipCard {
  id: string;
  card_number: string;
  client_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  discount_percentage: number;
  active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VipValidationResult {
  valid: boolean;
  card?: {
    id: string;
    cardNumber: string;
    clientName: string;
    discountPercentage: number;
  };
  error?: string;
}
