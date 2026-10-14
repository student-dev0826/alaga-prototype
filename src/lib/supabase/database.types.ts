// Schema-aligned types. Regenerate from the target Supabase project after deployment.
type Stamps = { created_at: string; updated_at: string };
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };
export type ProfileRow = Stamps & { id: string; display_name: string | null };
export type NotificationRow = { id: string; user_id: string; title: string; message: string; read_at: string | null; created_at: string };
export type AppointmentRow = Stamps & { id: string; user_id: string; slot_id: string; reference: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; cancelled_at: string | null };
export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, never, Pick<ProfileRow, 'display_name'>>;
      user_preferences: Table<Stamps & { id: string; user_id: string; text_size: 'standard' | 'large' | 'extra-large'; high_contrast: boolean; reduce_motion: boolean }>;
      facilities: Table<Stamps & { id: string; name: string; address: string; city: string; phone: string | null; operating_hours: string | null; latitude: number | null; longitude: number | null; timezone: string; is_verified: boolean; verified_at: string | null; booking_enabled: boolean }>;
      services: Table<Stamps & { id: string; slug: string; name: string; description: string | null; synonyms: string[]; is_verified: boolean; verified_at: string | null }>;
      facility_services: Table<Stamps & { id: string; facility_id: string; service_id: string; is_verified: boolean; verified_at: string | null; booking_enabled: boolean }>;
      appointment_slots: Table<Stamps & { id: string; facility_service_id: string; starts_at: string; ends_at: string; capacity: number; reserved_count: number; is_published: boolean }>;
      appointments: Table<AppointmentRow, never, never>;
      notifications: Table<NotificationRow, never, Pick<NotificationRow, 'read_at'>>;
      health_articles: Table<Stamps & { id: string; category_id: string; title: string; body: string; source_url: string | null; reviewed_at: string | null; published_at: string | null }>;
    };
    Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
  };
}
