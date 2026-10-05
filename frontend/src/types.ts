export type FeedbackStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESPONDED' | 'RESOLVED' | 'ARCHIVED';

export interface Feedback {
  id: number;
  booking_id: number;
  booking_reference: string;
  rating: number;
  comment: string | null;
  categories: string[];
  staff_response: string | null;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface FeedbackInput {
  rating: number;
  comment?: string;
  categories?: string[];
}

export interface StaffFeedbackOut extends Feedback {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
}

export interface FeedbackReportOut {
  total_feedback: number;
  average_rating: number;
  low_rating_count: number;
  rating_distribution: Record<number, number>;
  category_breakdown: Record<string, number>;
  submitted_feedback_count: number;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export type Status =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface EventType {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  dietary_information: string;
  is_active: boolean;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  event_type: EventType;
  event_type_id?: number;
  price_per_person: number;
  minimum_guest_count: number;
  maximum_guest_count?: number;
  is_active: boolean;
  menu_items: MenuItem[];
}

export interface Booking {
  id: number;
  reference: string;
  package_id: number;
  package_name: string;
  menu_snapshot: string[];
  price_per_person: number;
  estimated_total: number;
  event_date: string;
  event_time: string;
  event_location: string;
  guest_count: number;
  special_requirements: string | null;
  status: Status;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Optional staff fields
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_mobile?: string;
}
export interface Profile {
  full_name: string;
  mobile_number: string;
  address?: string | null;
}


export type WasteCategory = 'SPOILAGE' | 'OVERPRODUCTION' | 'PREP_WASTE' | 'DROPPED' | 'OTHER';

export interface WasteRecord {
  id: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: WasteCategory;
  wasteDate: string;
  bookingId?: number;
  bookingReference?: string;
  eventDate?: string;
  guestCount?: number;
  recordedById: number;
  recordedByName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteSummary {
  totalQuantity: number;
  byIngredient: Record<string, number>;
  byCategory: Record<string, number>;
}


export interface BookingOption {
  id: number;
  reference: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  guestCount: number;
  status: string;
}


export interface IngredientRequirementOut {
  id: number;
  menuItemId: number;
  ingredientName: string;
  quantityPerGuest: number;
  unit: string;
}

export interface IngredientRequirementInput {
  ingredientName: string;
  quantityPerGuest: number;
  unit: string;
}
export interface ForecastItemOut {
  ingredientName: string;
  unit: string;
  quantityPerGuestTotal: number;
  requiredQuantity: number;
  contributingMenuItems: string[];
}

export interface ForecastOut {
  bookingId: number | null;
  bookingReference: string | null;
  packageId: number;
  packageName: string;
  eventDate: string | null;
  guestCount: number;
  items: ForecastItemOut[];
}
export interface BillingMetricsOut {
  totalPaidRevenue: number;
  pendingReceivables: number;
  pipelineBookingValue: number;
  averageBookingValue: number;
  paidInvoiceCount: number;
  pendingInvoiceCount: number;
}
export interface CustomerSummaryOut {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  active: boolean;
  total_bookings: number;
  created_at: string;
}
export interface CustomerProfileOut {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string | null;
  address: string | null;
  active: boolean;
  created_at: string;
}

export interface CustomerMetricsOut {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  pipeline_booking_value: number;
}

export interface CustomerBookingHistoryOut {
  id: number;
  reference: string;
  event_date: string;
  package_name: string | null;
  guest_count: number;
  event_location: string | null;
  status: string;
  estimated_total: number;
  created_at: string;
}

export interface CustomerFeedbackHistoryOut {
  id: number;
  booking_reference: string | null;
  rating: number;
  comment: string | null;
  categories: string[];
  staff_response: string | null;
  status: string;
  created_at: string;
}

export interface CustomerInvoiceHistoryOut {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  event_name: string | null;
  created_at: string;
}

export interface Customer360Out {
  profile: CustomerProfileOut;
  metrics: CustomerMetricsOut;
  bookings: CustomerBookingHistoryOut[];
  feedback: CustomerFeedbackHistoryOut[];
  invoices: CustomerInvoiceHistoryOut[];
}

export type Role = 'GENERAL_MANAGER' | 'HEAD_CHEF' | 'CUSTOMER_SERVICE_SUPERVISOR' | 'EVENT_COORDINATION_OFFICER' | 'FINANCE_OFFICER' | 'CUSTOMER' | 'WAITER' | 'CLEANER' | 'CHEF';
export interface User { id: number; email: string; role: Role; is_active: boolean; created_at: string; }

