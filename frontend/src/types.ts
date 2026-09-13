export type Role = 'CUSTOMER' | 'CUSTOMER_RELATIONS_OFFICER' | 'SENIOR_CHEF' | 'OPERATIONS_MANAGER' | 'ACCOUNTS_EXECUTIVE' | 'ADMIN';
export interface User { id: number; email: string; role: Role; is_active: boolean }
export interface Profile { full_name: string; mobile_number: string; address: string | null }
export interface EventType { id: number; name: string }
export interface MenuItem { id: number; name: string; description: string; category: string; dietary_information: string; is_active: boolean }
export interface Package { id: number; name: string; description: string; event_type_id: number; event_type: EventType; price_per_person: string; minimum_guest_count: number; maximum_guest_count: number | null; is_active: boolean; menu_items: MenuItem[] }
export type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export interface Booking { id: number; reference: string; package_id: number; package_name: string; menu_snapshot: string[]; price_per_person: string; estimated_total: string; event_date: string; event_time: string; event_location: string; guest_count: number; special_requirements: string; status: Status; rejection_reason: string | null; customer_name?: string; customer_email?: string; customer_mobile?: string }
