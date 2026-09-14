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
  unresolved_feedback_count: number;
}

// Core domain types
export type Role =
  | 'ADMIN'
  | 'SENIOR_CHEF'
  | 'CUSTOMER_RELATIONS_OFFICER'
  | 'OPERATIONS_MANAGER'
  | 'ACCOUNTS_EXECUTIVE'
  | 'CUSTOMER';

export interface User {
  id: number;
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
