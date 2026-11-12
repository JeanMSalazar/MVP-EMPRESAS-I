import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { public_config } from './config.generated';
import {
  AcceptedContact,
  Incident,
  Notice,
  Professional,
  Profile,
  Quote,
  Review,
  Role,
  Service,
  ServiceRequest,
} from './models';

export const PUBLIC_CONFIG = new InjectionToken<{ url: string; anon_key: string }>('public_config', {
  providedIn: 'root',
  factory: () => public_config,
});

interface DemoData {
  requests: ServiceRequest[];
  quotes: Quote[];
  services: Service[];
  reviews: Review[];
  notices: Notice[];
  incidents: Incident[];
  professionals: Professional[];
  profile: Profile | null;
}

const DEMO_KEY = 'manocerca-demo-v2';
const SESSION_KEY = 'manocerca-demo-role';
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

function seed_data(): DemoData {
  const professionals: Professional[] = [
    {
      id: 'pro-luis',
      full_name: 'Luis Medina',
      specialty: 'Gasfitería',
      experience_years: 8,
      zone: 'Yanahuara',
      available: true,
      bio: 'Instalaciones, fugas y reparaciones con atención cuidadosa a cada detalle.',
      photo_url: '',
      portfolio: [],
      completed_count: 48,
      rating: 4.9,
      latitude: -16.391,
      longitude: -71.551,
    },
    {
      id: 'pro-rosa',
      full_name: 'Rosa Quispe',
      specialty: 'Electricidad',
      experience_years: 6,
      zone: 'Cayma',
      available: true,
      bio: 'Soluciones eléctricas seguras para tu hogar y negocio.',
      photo_url: '',
      portfolio: [],
      completed_count: 36,
      rating: 4.8,
      latitude: -16.373,
      longitude: -71.556,
    },
    {
      id: 'pro-carlos',
      full_name: 'Carlos Valdivia',
      specialty: 'Pintura',
      experience_years: 10,
      zone: 'Cercado',
      available: true,
      bio: 'Renovación de espacios, acabados prolijos y asesoría de color.',
      photo_url: '',
      portfolio: [],
      completed_count: 62,
      rating: 5.0,
      latitude: -16.399,
      longitude: -71.537,
    },
    {
      id: 'pro-ana',
      full_name: 'Ana Torres',
      specialty: 'Limpieza',
      experience_years: 5,
      zone: 'José Luis Bustamante y Rivero',
      available: false,
      bio: 'Limpieza profunda y mantenimiento para sentir tu casa como nueva.',
      photo_url: '',
      portfolio: [],
      completed_count: 29,
      rating: 4.9,
      latitude: -16.424,
      longitude: -71.523,
    },
    {
      id: 'pro-miguel',
      full_name: 'Miguel Salas',
      specialty: 'Carpintería',
      experience_years: 12,
      zone: 'Cerro Colorado',
      available: true,
      bio: 'Muebles a medida, puertas y reparaciones en madera.',
      photo_url: '',
      portfolio: [],
      completed_count: 41,
      rating: 4.8,
      latitude: -16.36,
      longitude: -71.58,
    },
    {
      id: 'pro-julia',
      full_name: 'Julia Mamani',
      specialty: 'Albañilería',
      experience_years: 9,
      zone: 'Sachaca',
      available: true,
      bio: 'Reparaciones, enchapes y pequeñas remodelaciones.',
      photo_url: '',
      portfolio: [],
      completed_count: 33,
      rating: 4.7,
      latitude: -16.419,
      longitude: -71.572,
    },
  ];
  const requests: ServiceRequest[] = [
    {
      id: 'request-demo',
      client_id: 'client-demo',
      professional_id: 'pro-luis',
      specialty: 'Gasfitería',
      title: 'Reparar fuga bajo el lavadero',
      description:
        'Hay una pequeña fuga en la conexión del lavadero de cocina. Necesito revisar y cambiar la pieza si hace falta.',
      address: 'Av. Ejército 710',
      zone: 'Yanahuara',
      latitude: -16.391,
      longitude: -71.551,
      urgent: false,
      scheduled_at: null,
      status: 'QUOTED',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      photos: [],
    },
    {
      id: 'request-history',
      client_id: 'client-demo',
      professional_id: 'pro-rosa',
      specialty: 'Electricidad',
      title: 'Instalación de lámpara colgante',
      description: 'Instalación en sala principal.',
      address: 'Calle Jerusalén 204',
      zone: 'Cercado',
      latitude: -16.398,
      longitude: -71.536,
      urgent: false,
      scheduled_at: null,
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      photos: [],
    },
  ];
  const quotes: Quote[] = [
    {
      id: 'quote-demo',
      request_id: 'request-demo',
      professional_id: 'pro-luis',
      version: 1,
      price: 85,
      description: 'Revisión, repuesto básico y reparación de la fuga.',
      notes: 'Incluye mano de obra. Si se necesita un repuesto especial, lo conversamos antes.',
      status: 'PENDING',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'quote-history',
      request_id: 'request-history',
      professional_id: 'pro-rosa',
      version: 1,
      price: 120,
      description: 'Instalación de lámpara',
      notes: '',
      status: 'ACCEPTED',
      created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    },
  ];
  const services: Service[] = [
    {
      id: 'service-history',
      request_id: 'request-history',
      client_id: 'client-demo',
      professional_id: 'pro-rosa',
      quote_id: 'quote-history',
      status: 'COMPLETED',
      on_the_way: false,
      completed_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    },
  ];
  const reviews: Review[] = [
    {
      id: 'review-history',
      service_id: 'service-history',
      reviewer_id: 'client-demo',
      reviewee_id: 'pro-rosa',
      rating: 5,
      comment: 'Muy puntual y dejó todo funcionando perfecto.',
      created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    },
  ];
  const notices: Notice[] = [
    {
      id: 'notice-demo',
      user_id: 'client-demo',
      title: 'Recibiste una cotización',
      message: 'Luis envió una propuesta para tu solicitud de gasfitería.',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
  return {
    requests,
    quotes,
    services,
    reviews,
    notices,
    incidents: [],
    professionals,
    profile: null,
  };
}

@Injectable({ providedIn: 'root' })
export class Marketplace {
  private readonly config = inject(PUBLIC_CONFIG);
  readonly is_demo = !this.config.url || !this.config.anon_key;
  private readonly supabase: SupabaseClient | null = this.is_demo
    ? null
    : createClient(this.config.url, this.config.anon_key);
  private notification_channel: RealtimeChannel | null = null;
  private subscribed_user_id = '';
  private load_version = 0;
  readonly user = signal<Profile | null>(null);
  readonly professionals = signal<Professional[]>([]);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly quotes = signal<Quote[]>([]);
  readonly services = signal<Service[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly notices = signal<Notice[]>([]);
  readonly incidents = signal<Incident[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly toast = signal('');
  readonly password_recovery = signal(false);
  readonly unread_count = computed(
    () => this.notices().filter((item) => item.user_id === this.user()?.id && !item.read).length,
  );

  constructor() {
    void this.load();
    this.supabase?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') this.password_recovery.set(true);
      if (event === 'SIGNED_OUT') this.password_recovery.set(false);
      setTimeout(() => void this.load(), 0);
    });
  }

  private demo_data(): DemoData {
    try {
      const stored = localStorage.getItem(DEMO_KEY);
      const data = stored ? (JSON.parse(stored) as DemoData) : seed_data();
      data.professionals = data.professionals.map((item) => ({
        ...item,
        portfolio: item.portfolio ?? [],
      }));
      return data;
    } catch {
      return seed_data();
    }
  }

  private save_demo(): void {
    localStorage.setItem(
      DEMO_KEY,
      JSON.stringify({
        requests: this.requests(),
        quotes: this.quotes(),
        services: this.services(),
        reviews: this.reviews(),
        notices: this.notices(),
        incidents: this.incidents(),
        professionals: this.professionals(),
        profile: this.user(),
      } satisfies DemoData),
    );
  }

  private fail(context: string, error: unknown): never {
    const details = error && typeof error === 'object' ? error as Record<string, unknown> : null;
    const raw = error instanceof Error
      ? error.message
      : typeof details?.['message'] === 'string'
        ? details['message']
        : String(error);
    const reason = details?.['code'] === '23514' && raw.includes('service_requests_description_check')
      ? 'La descripción debe tener entre 10 y 1200 caracteres.'
      : details?.['code'] === '23514' && raw.includes('service_requests_title_check')
        ? 'El título debe tener entre 3 y 90 caracteres.'
        : raw;
    const message = `${context}: ${reason}`;
    this.error.set(message);
    throw new Error(message);
  }

  async load(): Promise<void> {
    const version = ++this.load_version;
    this.error.set('');
    if (this.is_demo) {
      const data = this.demo_data();
      this.professionals.set(data.professionals);
      this.requests.set(data.requests);
      this.quotes.set(data.quotes);
      this.services.set(data.services);
      this.reviews.set(data.reviews);
      this.notices.set(data.notices);
      this.incidents.set(data.incidents);
      const role = localStorage.getItem(SESSION_KEY);
      const selected =
        role === 'professional'
          ? {
              id: 'pro-luis',
              role: 'professional' as const,
              full_name: 'Luis Medina',
              email: 'luis@demo.pe',
              phone: '999 123 456',
              zone: 'Yanahuara',
            }
          : role === 'client'
            ? {
                id: 'client-demo',
                role: 'client' as const,
                full_name: 'María Pérez',
                email: 'maria@demo.pe',
                phone: '999 654 321',
                zone: 'Yanahuara',
              }
            : null;
      this.user.set(data.profile?.id === selected?.id ? data.profile : selected);
      return;
    }
    const db = this.supabase!;
    try {
      const session = await db.auth.getUser();
      const auth_user = session.data.user;
      if (!auth_user) {
        const [professional_result, review_result] = await Promise.all([
          db.from('professionals').select('*, portfolio_photos(url)'),
          db.from('reviews').select('*').order('created_at', { ascending: false }),
        ]);
        if (professional_result.error) throw professional_result.error;
        if (review_result.error) throw review_result.error;
        if (version !== this.load_version) return;
        this.user.set(null);
        this.professionals.set(this.with_portfolio(professional_result.data ?? []));
        this.reviews.set((review_result.data ?? []) as Review[]);
        this.requests.set([]);
        this.quotes.set([]);
        this.services.set([]);
        this.notices.set([]);
        this.incidents.set([]);
        this.subscribe_notifications('');
        return;
      }
      const [
        professional_result,
        request_result,
        quote_result,
        service_result,
        review_result,
        notice_result,
        incident_result,
        profile_result,
      ] = await Promise.all([
        db.from('professionals').select('*, portfolio_photos(url)'),
        db
          .from('service_requests')
          .select('*, request_photos(storage_path)')
          .order('created_at', { ascending: false }),
        db.from('quotes').select('*').order('created_at', { ascending: false }),
        db.from('services').select('*').order('created_at', { ascending: false }),
        db.from('reviews').select('*').order('created_at', { ascending: false }),
        db.from('notifications').select('*').order('created_at', { ascending: false }),
        db.from('incidents').select('*').order('created_at', { ascending: false }),
        db.from('profiles').select('*').eq('id', auth_user.id).single(),
      ]);
      for (const result of [
        professional_result,
        request_result,
        quote_result,
        service_result,
        review_result,
        notice_result,
        incident_result,
        profile_result,
      ]) {
        if (result.error) throw result.error;
      }
      const requests_with_photos = await Promise.all(
        (request_result.data ?? []).map(async (row: Record<string, unknown>) => {
          const photos = await Promise.all(
            ((row['request_photos'] ?? []) as { storage_path: string }[]).map(async (photo) => {
              const signed = await db.storage
                .from('request-photos')
                .createSignedUrl(photo.storage_path, 3600);
              if (signed.error) throw signed.error;
              return signed.data.signedUrl;
            }),
          );
          return { ...row, photos };
        }),
      );
      if (version !== this.load_version) return;
      this.user.set(profile_result.data as Profile | null);
      this.professionals.set(this.with_portfolio(professional_result.data ?? []));
      this.requests.set(requests_with_photos as ServiceRequest[]);
      this.quotes.set((quote_result.data ?? []) as Quote[]);
      this.services.set((service_result.data ?? []) as Service[]);
      this.reviews.set((review_result.data ?? []) as Review[]);
      this.notices.set((notice_result.data ?? []) as Notice[]);
      this.incidents.set((incident_result.data ?? []) as Incident[]);
      this.subscribe_notifications(auth_user.id);
    } catch (error) {
      if (version !== this.load_version) return;
      this.fail('No se pudieron cargar los datos', error);
    }
  }

  private with_portfolio(rows: Record<string, unknown>[]): Professional[] {
    return rows.map((row) => ({
      ...row,
      portfolio: ((row['portfolio_photos'] ?? []) as { url: string }[]).map((photo) => photo.url),
    })) as Professional[];
  }

  private subscribe_notifications(user_id: string): void {
    if (!this.supabase || this.subscribed_user_id === user_id) return;
    if (this.notification_channel) void this.supabase.removeChannel(this.notification_channel);
    this.subscribed_user_id = user_id;
    this.notification_channel = null;
    if (!user_id) return;
    this.notification_channel = this.supabase
      .channel(`notifications-${user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user_id}`,
        },
        () => void this.load(),
      )
      .subscribe();
  }

  demo_as(role: Role): void {
    localStorage.setItem(SESSION_KEY, role);
    void this.load();
    this.toast.set(role === 'client' ? 'Vista de cliente activada' : 'Vista de maestro activada');
  }

  async register(
    role: Role,
    full_name: string,
    email: string,
    password: string,
    phone: string,
    zone: string,
    specialty: string,
  ): Promise<'signed_in' | 'confirmation_required'> {
    if (this.is_demo) {
      this.demo_as(role);
      return 'signed_in';
    }
    try {
      const result = await this.supabase!.auth.signUp({
        email,
        password,
        options: { data: { role, full_name, phone, zone, specialty } },
      });
      if (result.error) throw result.error;
      if (!result.data.session) return 'confirmation_required';
      await this.load();
      return 'signed_in';
    } catch (error) {
      this.fail('No se pudo crear la cuenta', error);
    }
  }

  async login(email: string, password: string, role: Role): Promise<void> {
    if (this.is_demo) {
      this.demo_as(role);
      return;
    }
    try {
      const result = await this.supabase!.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo iniciar sesión', error);
    }
  }

  async get_accepted_contact(request_id: string): Promise<AcceptedContact | null> {
    if (this.is_demo) return null;
    const result = await this.supabase!.rpc('get_accepted_contact', { p_request_id: request_id });
    if (result.status === 401 || result.status === 403 || result.error?.code === '42501')
      return null;
    if (result.error) throw new Error('No se pudieron cargar los datos de contacto.');
    const row = Array.isArray(result.data) ? result.data[0] : null;
    if (!row) return null;
    if (typeof row.id !== 'string' || typeof row.full_name !== 'string'
      || typeof row.phone !== 'string')
      throw new Error('La respuesta de contacto no tiene el formato esperado.');
    return row as AcceptedContact;
  }

  async request_password_reset(email: string): Promise<void> {
    if (this.is_demo) throw new Error('La recuperación requiere conexión con Supabase.');
    const result = await this.supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-contrasena`,
    });
    if (result.error) throw new Error('No se pudo enviar el correo de recuperación.');
  }

  async update_password(password: string): Promise<void> {
    if (this.is_demo || !this.password_recovery())
      throw new Error('Abre el enlace de recuperación recibido por correo.');
    const result = await this.supabase!.auth.updateUser({ password });
    if (result.error) throw new Error('No se pudo actualizar la contraseña.');
    this.password_recovery.set(false);
  }

  async logout(): Promise<void> {
    if (this.is_demo) {
      localStorage.removeItem(SESSION_KEY);
      this.user.set(null);
      return;
    }
    await this.supabase!.auth.signOut();
    await this.load();
  }

  async save_profile(profile: Profile, professional?: Partial<Professional>): Promise<void> {
    if (this.is_demo) {
      this.user.set(profile);
      if (professional)
        this.professionals.update((list) =>
          list.map((item) =>
            item.id === profile.id
              ? { ...item, ...professional, full_name: profile.full_name }
              : item,
          ),
        );
      this.save_demo();
      return;
    }
    try {
      const result = await this.supabase!.from('profiles')
        .update({ full_name: profile.full_name, phone: profile.phone, zone: profile.zone })
        .eq('id', profile.id);
      if (result.error) throw result.error;
      if (professional) {
        const update = await this.supabase!.from('professionals')
          .update({ ...professional, full_name: profile.full_name, zone: profile.zone })
          .eq('id', profile.id);
        if (update.error) throw update.error;
      }
      await this.load();
    } catch (error) {
      this.fail('No se pudo guardar el perfil', error);
    }
  }

  async upload_profile_media(file: File, kind: 'avatar' | 'portfolio'): Promise<void> {
    const user = this.user();
    if (!user || user.role !== 'professional')
      throw new Error('Inicia sesión como maestro para subir imágenes.');
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error('Elige una imagen de máximo 5 MB.');
    const professional = this.professionals().find((item) => item.id === user.id);
    if (kind === 'portfolio' && (professional?.portfolio.length ?? 0) >= 6)
      throw new Error('Puedes mostrar hasta 6 fotos en tu portafolio.');
    if (this.is_demo) {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      this.professionals.update((list) =>
        list.map((item) =>
          item.id === user.id
            ? kind === 'avatar'
              ? { ...item, photo_url: url }
              : { ...item, portfolio: [...item.portfolio, url] }
            : item,
        ),
      );
      this.save_demo();
      return;
    }
    try {
      const path = `${user.id}/${kind}/${id()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const upload = await this.supabase!.storage.from('professional-media').upload(path, file, {
        contentType: file.type,
      });
      if (upload.error) throw upload.error;
      const url =
        this.supabase!.storage.from('professional-media').getPublicUrl(path).data.publicUrl;
      const result =
        kind === 'avatar'
          ? await this.supabase!.from('professionals').update({ photo_url: url }).eq('id', user.id)
          : await this.supabase!.from('portfolio_photos').insert({
              professional_id: user.id,
              storage_path: path,
              url,
            });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo subir la imagen', error);
    }
  }

  async create_request(
    input: Omit<ServiceRequest, 'id' | 'client_id' | 'status' | 'created_at' | 'photos'>,
    files: File[],
  ): Promise<string> {
    const user = this.user();
    if (!user || user.role !== 'client')
      throw new Error('Inicia sesión como cliente para publicar una solicitud.');
    const request_id = id();
    if (this.is_demo) {
      const photos = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );
      this.requests.update((list) => [
        {
          ...input,
          id: request_id,
          client_id: user.id,
          status: 'REQUESTED',
          created_at: now(),
          photos,
        },
        ...list,
      ]);
      this.save_demo();
      this.toast.set('Solicitud publicada. Los maestros ya pueden verla.');
      return request_id;
    }
    try {
      const result = await this.supabase!.from('service_requests')
        .insert({ ...input, client_id: user.id })
        .select('id')
        .single();
      if (result.error) throw result.error;
      for (const file of files) {
        const path = `${user.id}/${result.data.id}/${id()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const upload = await this.supabase!.storage.from('request-photos').upload(path, file, {
          contentType: file.type,
        });
        if (upload.error) throw upload.error;
        const photo = await this.supabase!.from('request_photos').insert({
          request_id: result.data.id,
          storage_path: path,
        });
        if (photo.error) throw photo.error;
      }
      await this.load();
      return result.data.id as string;
    } catch (error) {
      this.fail('No se pudo publicar la solicitud', error);
    }
  }

  async send_quote(
    request: ServiceRequest,
    price: number,
    description: string,
    notes: string,
  ): Promise<void> {
    const user = this.user();
    if (!user || user.role !== 'professional')
      throw new Error('Inicia sesión como maestro para cotizar.');
    const professional = this.professionals().find((item) => item.id === user.id);
    if (
      !professional ||
      (request.professional_id !== user.id &&
        (request.professional_id || request.specialty !== professional.specialty))
    )
      throw new Error('La solicitud no corresponde a tu especialidad.');
    if (!['REQUESTED', 'QUOTED', 'ACCEPTED'].includes(request.status))
      throw new Error('Esta solicitud ya está cerrada.');
    if (price <= 0 || description.trim().length < 3)
      throw new Error('Indica un precio y alcance válidos.');
    const previous = this.quotes().filter(
      (item) => item.request_id === request.id && item.professional_id === user.id,
    );
    const version = Math.max(0, ...previous.map((item) => item.version)) + 1;
    if (this.is_demo) {
      this.quotes.update((list) => [
        {
          id: id(),
          request_id: request.id,
          professional_id: user.id,
          version,
          price,
          description,
          notes,
          status: 'PENDING',
          created_at: now(),
        },
        ...list.map((item) =>
          item.request_id === request.id &&
          item.professional_id === user.id &&
          (item.status === 'PENDING' || item.status === 'ACCEPTED')
            ? { ...item, status: 'SUPERSEDED' as const }
            : item,
        ),
      ]);
      this.requests.update((list) =>
        list.map((item) => (item.id === request.id ? { ...item, status: 'QUOTED' } : item)),
      );
      this.services.update((list) =>
        list.map((item) =>
          item.request_id === request.id && item.status === 'ACCEPTED'
            ? { ...item, status: 'QUOTED', on_the_way: false }
            : item,
        ),
      );
      this.push_notice(
        request.client_id,
        'Nueva cotización',
        `${user.full_name} envió una propuesta para “${request.title}”.`,
      );
      this.save_demo();
      return;
    }
    try {
      const result = await this.supabase!.rpc('submit_quote', {
        p_request_id: request.id,
        p_price: price,
        p_description: description,
        p_notes: notes,
      });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo enviar la cotización', error);
    }
  }

  async decide_quote(quote: Quote, accept: boolean): Promise<void> {
    const request = this.requests().find((item) => item.id === quote.request_id);
    const user = this.user();
    if (!request || user?.id !== request.client_id)
      throw new Error('Solo el cliente puede decidir sobre esta cotización.');
    if (quote.status !== 'PENDING') throw new Error('Esta cotización ya no está disponible.');
    if (this.is_demo) {
      this.quotes.update((list) =>
        list.map((item) =>
          item.id === quote.id
            ? { ...item, status: accept ? 'ACCEPTED' : 'REJECTED' }
            : accept && item.request_id === quote.request_id && item.status === 'PENDING'
              ? { ...item, status: 'REJECTED' }
              : item,
        ),
      );
      if (accept) {
        this.services.update((list) =>
          list.some((item) => item.request_id === request.id)
            ? list.map((item) =>
                item.request_id === request.id
                  ? {
                      ...item,
                      professional_id: quote.professional_id,
                      quote_id: quote.id,
                      status: 'ACCEPTED',
                      on_the_way: false,
                    }
                  : item,
              )
            : [
                {
                  id: id(),
                  request_id: request.id,
                  client_id: user.id,
                  professional_id: quote.professional_id,
                  quote_id: quote.id,
                  status: 'ACCEPTED',
                  on_the_way: false,
                  completed_at: null,
                  created_at: now(),
                },
                ...list,
              ],
        );
        this.requests.update((list) =>
          list.map((item) =>
            item.id === request.id
              ? { ...item, status: 'ACCEPTED', professional_id: quote.professional_id }
              : item,
          ),
        );
      }
      this.push_notice(
        quote.professional_id,
        accept ? 'Cotización aceptada' : 'Cotización rechazada',
        `La propuesta para “${request.title}” fue ${accept ? 'aceptada' : 'rechazada'}.`,
      );
      this.save_demo();
      return;
    }
    try {
      const result = await this.supabase!.rpc('decide_quote', {
        p_quote_id: quote.id,
        p_accept: accept,
      });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo responder a la cotización', error);
    }
  }

  async update_service(
    service: Service,
    action: 'on_the_way' | 'complete' | 'cancel' | 'dispute',
  ): Promise<void> {
    const user = this.user();
    if (!user) throw new Error('Inicia sesión para actualizar el servicio.');
    if (
      (service.status !== 'ACCEPTED' && !(service.status === 'QUOTED' && action === 'cancel')) ||
      (user.id !== service.client_id && user.id !== service.professional_id)
    )
      throw new Error('El servicio no está activo o no participas en él.');
    if ((action === 'on_the_way' || action === 'complete') && user.id !== service.professional_id)
      throw new Error('Solo el maestro puede marcar ese estado.');
    if (action === 'cancel' && user.id !== service.client_id)
      throw new Error('Solo el cliente puede cancelar.');
    if (this.is_demo) {
      this.services.update((list) =>
        list.map((item) =>
          item.id === service.id
            ? {
                ...item,
                on_the_way: action === 'on_the_way' ? true : item.on_the_way,
                status:
                  action === 'complete'
                    ? 'COMPLETED'
                    : action === 'cancel'
                      ? 'CANCELLED'
                      : action === 'dispute'
                        ? 'DISPUTED'
                        : item.status,
                completed_at: action === 'complete' ? now() : item.completed_at,
              }
            : item,
        ),
      );
      if (action !== 'on_the_way')
        this.requests.update((list) =>
          list.map((item) =>
            item.id === service.request_id
              ? {
                  ...item,
                  status:
                    action === 'complete'
                      ? 'COMPLETED'
                      : action === 'cancel'
                        ? 'CANCELLED'
                        : 'DISPUTED',
                }
              : item,
          ),
        );
      if (action === 'complete')
        this.professionals.update((list) =>
          list.map((item) =>
            item.id === service.professional_id
              ? { ...item, completed_count: item.completed_count + 1 }
              : item,
          ),
        );
      this.push_notice(
        user.id === service.client_id ? service.professional_id : service.client_id,
        action === 'on_the_way'
          ? 'Maestro en camino'
          : action === 'complete'
            ? 'Servicio completado'
            : 'Servicio actualizado',
        'Revisa el estado de tu servicio.',
      );
      this.save_demo();
      return;
    }
    try {
      const result = await this.supabase!.rpc('update_service_status', {
        p_service_id: service.id,
        p_action: action,
      });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo actualizar el servicio', error);
    }
  }

  async add_review(service: Service, rating: number, comment: string): Promise<void> {
    const user = this.user();
    if (!user || service.status !== 'COMPLETED')
      throw new Error('Solo se puede calificar un servicio completado.');
    if (user.id !== service.client_id && user.id !== service.professional_id)
      throw new Error('No participaste en este servicio.');
    if (
      this.reviews().some((item) => item.service_id === service.id && item.reviewer_id === user.id)
    )
      throw new Error('Ya calificaste este servicio.');
    if (rating < 1 || rating > 5 || comment.trim().length < 3)
      throw new Error('Ingresa una calificación y un comentario.');
    const reviewee_id = user.id === service.client_id ? service.professional_id : service.client_id;
    if (this.is_demo) {
      this.reviews.update((list) => [
        {
          id: id(),
          service_id: service.id,
          reviewer_id: user.id,
          reviewee_id,
          rating,
          comment,
          created_at: now(),
        },
        ...list,
      ]);
      if (reviewee_id === service.professional_id)
        this.professionals.update((list) =>
          list.map((item) =>
            item.id === reviewee_id
              ? {
                  ...item,
                  rating:
                    Math.round(
                      ((item.rating * (item.completed_count - 1) + rating) / item.completed_count) *
                        10,
                    ) / 10,
                }
              : item,
          ),
        );
      this.push_notice(
        reviewee_id,
        'Nueva calificación',
        'Recibiste una reseña por un servicio completado.',
      );
      this.save_demo();
      return;
    }
    try {
      const result = await this.supabase!.from('reviews').insert({
        service_id: service.id,
        reviewer_id: user.id,
        reviewee_id,
        rating,
        comment,
      });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo guardar la calificación', error);
    }
  }

  async report_incident(service: Service, description: string): Promise<void> {
    const user = this.user();
    if (!user) throw new Error('Inicia sesión para reportar un problema.');
    if (user.id !== service.client_id && user.id !== service.professional_id)
      throw new Error('No participaste en este servicio.');
    if (description.trim().length < 5) throw new Error('Describe el problema con más detalle.');
    if (this.is_demo) {
      this.incidents.update((list) => [
        {
          id: id(),
          service_id: service.id,
          reporter_id: user.id,
          description,
          status: 'OPEN',
          created_at: now(),
        },
        ...list,
      ]);
      this.save_demo();
      return;
    }
    try {
      const result = await this.supabase!.from('incidents').insert({
        service_id: service.id,
        reporter_id: user.id,
        description,
      });
      if (result.error) throw result.error;
      await this.load();
    } catch (error) {
      this.fail('No se pudo registrar el reporte', error);
    }
  }

  async mark_notice_read(notice: Notice): Promise<void> {
    if (this.is_demo) {
      this.notices.update((list) =>
        list.map((item) => (item.id === notice.id ? { ...item, read: true } : item)),
      );
      this.save_demo();
      return;
    }
    const result = await this.supabase!.from('notifications')
      .update({ read: true })
      .eq('id', notice.id);
    if (result.error) this.fail('No se pudo marcar la notificación', result.error);
    await this.load();
  }

  async search_professionals(
    specialty: string,
    zone: string,
    available_only: boolean,
    latitude = -16.3989,
    longitude = -71.535,
  ): Promise<Professional[]> {
    if (this.is_demo)
      return this.professionals()
        .filter(
          (item) =>
            (!specialty || item.specialty === specialty) &&
            (!zone || item.zone === zone) &&
            (!available_only || item.available),
        )
        .sort((a, b) => b.rating - a.rating || b.completed_count - a.completed_count);
    try {
      const result = await this.supabase!.rpc('search_professionals', {
        p_specialty: specialty || null,
        p_zone: zone || null,
        p_lat: latitude,
        p_lng: longitude,
        p_radius_km: 25,
        p_available_only: available_only,
      });
      if (result.error) throw result.error;
      return result.data as Professional[];
    } catch (error) {
      this.fail('No se pudo buscar maestros', error);
    }
  }

  private push_notice(user_id: string, title: string, message: string): void {
    this.notices.update((list) => [
      { id: id(), user_id, title, message, read: false, created_at: now() },
      ...list,
    ]);
  }
}
