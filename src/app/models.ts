export type Role = 'client' | 'professional';
export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';
export type ServiceStatus = 'QUOTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email?: string;
  phone: string;
  zone: string;
}

export interface AcceptedContact {
  id: string;
  full_name: string;
  phone: string;
}

export interface Professional {
  id: string;
  full_name: string;
  specialty: string;
  experience_years: number;
  zone: string;
  available: boolean;
  bio: string;
  photo_url: string;
  portfolio: string[];
  completed_count: number;
  rating: number;
  latitude: number;
  longitude: number;
}

export interface ServiceRequest {
  id: string;
  client_id: string;
  professional_id: string | null;
  specialty: string;
  title: string;
  description: string;
  address: string;
  zone: string;
  latitude: number;
  longitude: number;
  urgent: boolean;
  scheduled_at: string | null;
  status: 'REQUESTED' | 'QUOTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  created_at: string;
  photos: string[];
}

export interface Quote {
  id: string;
  request_id: string;
  professional_id: string;
  version: number;
  price: number;
  description: string;
  notes: string;
  status: QuoteStatus;
  created_at: string;
}

export interface Service {
  id: string;
  request_id: string;
  client_id: string;
  professional_id: string;
  quote_id: string;
  status: ServiceStatus;
  on_the_way: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notice {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Incident {
  id: string;
  service_id: string;
  reporter_id: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  created_at: string;
}

export const SPECIALTIES = [
  'Gasfitería',
  'Electricidad',
  'Pintura',
  'Carpintería',
  'Limpieza',
  'Albañilería',
];
export const ZONES = [
  'Cercado',
  'Cayma',
  'Yanahuara',
  'José Luis Bustamante y Rivero',
  'Cerro Colorado',
  'Sachaca',
  'Paucarpata',
];
