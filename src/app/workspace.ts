import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Marketplace } from './marketplace';
import {
  AcceptedContact,
  Incident,
  Professional,
  Profile,
  Quote,
  Service,
  ServiceRequest,
  SPECIALTIES,
  ZONES,
} from './models';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink],
  template: `
    @if (market.user(); as user) {
      <section class="dashboard-top">
        <div class="container dashboard-top-inner">
          <div>
            <div class="eyebrow eyebrow-light">TU ESPACIO EN MANOCERCA</div>
            <h1>Hola, {{ first_name(user.full_name) }} <span>✳</span></h1>
            <p>
              {{
                user.role === 'client'
                  ? 'Aquí encontrarás tus solicitudes, propuestas y servicios.'
                  : 'Tu trabajo, tus propuestas y tus próximos clientes.'
              }}
            </p>
          </div>
          <a
            class="button button-cream"
            [routerLink]="user.role === 'client' ? '/solicitar' : '/explorar'"
            >{{ user.role === 'client' ? 'Nueva solicitud' : 'Explorar maestros' }} ↗</a
          >
        </div>
      </section>
      <section class="dashboard-content">
        <div class="container dashboard-layout">
          <nav class="dashboard-menu" aria-label="Mi espacio">
            <button [class.active]="tab === 'overview'" (click)="tab = 'overview'">
              ▤ <span>Resumen</span></button
            ><button [class.active]="tab === 'history'" (click)="tab = 'history'">
              ◷ <span>Historial</span></button
            ><button [class.active]="tab === 'incidents'" (click)="tab = 'incidents'">
              ⚑ <span>Incidencias</span></button
            ><button [class.active]="tab === 'notifications'" (click)="tab = 'notifications'">
              ♧ <span>Notificaciones</span>
              @if (market.unread_count()) {
                <b>{{ market.unread_count() }}</b>
              }</button
            ><button [class.active]="tab === 'profile'" (click)="open_profile()">
              ♙ <span>Mi perfil</span>
            </button>
          </nav>
          <div class="dashboard-main">
            @if (tab === 'overview') {
              <div class="dash-section-header">
                <div>
                  <h2>{{ user.role === 'client' ? 'Mis solicitudes' : 'Solicitudes para ti' }}</h2>
                  <p>
                    {{
                      user.role === 'client'
                        ? 'Revisa qué sucede con cada trabajo que publicaste.'
                        : 'Explora trabajos de tu especialidad y envía propuestas.'
                    }}
                  </p>
                </div>
              </div>
              <div class="stats-grid">
                <div>
                  <span>Solicitudes</span><strong>{{ visible_requests(user).length }}</strong
                  ><small>{{ user.role === 'client' ? 'publicadas' : 'disponibles' }}</small>
                </div>
                <div>
                  <span>Cotizaciones</span><strong>{{ my_quotes(user).length }}</strong
                  ><small>{{ user.role === 'client' ? 'recibidas' : 'enviadas' }}</small>
                </div>
                <div>
                  <span>Servicios</span><strong>{{ my_services(user).length }}</strong
                  ><small>en tu historial</small>
                </div>
              </div>
              <div class="dashboard-list">
                @for (request of visible_requests(user); track request.id) {
                  <a class="request-row" [routerLink]="['/solicitudes', request.id]"
                    ><div class="request-row-icon">
                      {{
                        request.specialty === 'Electricidad'
                          ? 'ϟ'
                          : request.specialty === 'Gasfitería'
                            ? '◉'
                            : '✳'
                      }}
                    </div>
                    <div>
                      <div class="request-row-heading">
                        <strong>{{ request.title }}</strong
                        ><span
                          class="status-pill"
                          [class]="'status-pill status-' + request.status.toLowerCase()"
                          >{{ status_label(request.status) }}</span
                        >
                      </div>
                      <p>
                        {{ request.specialty }} · {{ request.zone }} ·
                        {{ date(request.created_at) }}
                      </p>
                    </div>
                    <span class="request-row-arrow">↗</span></a
                  >
                } @empty {
                  <div class="empty-state">
                    <span>✦</span>
                    <h3>
                      {{
                        user.role === 'client'
                          ? 'Aún no tienes solicitudes'
                          : 'Todavía no hay trabajos de tu especialidad'
                      }}
                    </h3>
                    <p>
                      {{
                        user.role === 'client'
                          ? 'Publica el primer trabajo y empieza a recibir cotizaciones.'
                          : 'Vuelve pronto para encontrar nuevas oportunidades.'
                      }}
                    </p>
                    @if (user.role === 'client') {
                      <a class="button button-primary" routerLink="/solicitar">Crear solicitud ↗</a>
                    }
                  </div>
                }
              </div>
            } @else if (tab === 'history') {
              <div class="dash-section-header">
                <div>
                  <h2>Historial de servicios</h2>
                  <p>Todos tus trabajos en un solo lugar.</p>
                </div>
              </div>
              <div class="dashboard-list">
                @for (service of my_services(user); track service.id) {
                  <div class="service-history">
                    <div>
                      <strong>{{ request_for(service.request_id)?.title ?? 'Servicio' }}</strong
                      ><span
                        class="status-pill"
                        [class]="'status-pill status-' + service.status.toLowerCase()"
                        >{{ status_label(service.status) }}</span
                      >
                      <p>
                        {{ request_for(service.request_id)?.specialty }} ·
                        {{ date(service.created_at) }}
                      </p>
                    </div>
                    <div>
                      <a class="link-arrow" [routerLink]="['/solicitudes', service.request_id]"
                        >Ver detalles ↗</a
                      >
                      @if (user.role === 'client' && service.status === 'COMPLETED') {
                        <a
                          class="link-arrow"
                          routerLink="/solicitar"
                          [queryParams]="{ maestro: service.professional_id }"
                          >Volver a contratar ↗</a
                        >
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <span>◷</span>
                    <h3>Tu historial aparecerá aquí</h3>
                    <p>
                      Cuando aceptes una propuesta, podrás seguir el servicio desde este espacio.
                    </p>
                  </div>
                }
              </div>
            } @else if (tab === 'incidents') {
              <div class="dash-section-header">
                <div>
                  <h2>Mis incidencias</h2>
                  <p>Seguimiento de los problemas que reportaste.</p>
                </div>
              </div>
              <div class="dashboard-list">
                @for (incident of my_incidents(user); track incident.id) {
                  <div class="service-history">
                    <div>
                      <strong>{{
                        request_for_service(incident.service_id)?.title ?? 'Servicio'
                      }}</strong>
                      <span class="status-pill">{{ incident_status(incident.status) }}</span>
                      <p>{{ incident.description }}</p>
                    </div>
                    <a
                      class="link-arrow"
                      [routerLink]="['/solicitudes', request_for_service(incident.service_id)?.id]"
                      >Ver servicio ↗</a
                    >
                  </div>
                } @empty {
                  <div class="empty-state">
                    <span>⚑</span>
                    <h3>No tienes incidencias</h3>
                    <p>Si surge un problema con un servicio, puedes reportarlo desde su detalle.</p>
                  </div>
                }
              </div>
            } @else if (tab === 'notifications') {
              <div class="dash-section-header">
                <div>
                  <h2>Notificaciones</h2>
                  <p>Novedades de tus solicitudes y servicios.</p>
                </div>
              </div>
              <div class="dashboard-list">
                @for (notice of my_notices(user); track notice.id) {
                  <button
                    class="notice-row"
                    [class.unread]="!notice.read"
                    type="button"
                    (click)="market.mark_notice_read(notice)"
                  >
                    <span class="notice-icon">✦</span
                    ><span
                      ><strong>{{ notice.title }}</strong
                      ><small>{{ notice.message }}</small
                      ><i>{{ date(notice.created_at) }}</i></span
                    >
                    @if (!notice.read) {
                      <b></b>
                    }
                  </button>
                } @empty {
                  <div class="empty-state">
                    <span>♧</span>
                    <h3>Todo al día</h3>
                    <p>Aquí te avisaremos cuando haya novedades.</p>
                  </div>
                }
              </div>
            } @else {
              <div class="dash-section-header">
                <div>
                  <h2>Mi perfil</h2>
                  <p>Mantén tus datos al día para que podamos conectar mejor.</p>
                </div>
              </div>
              <form class="surface-card profile-form" (ngSubmit)="save_profile()">
                <div class="form-two">
                  <label
                    >Nombre completo<input
                      name="full_name"
                      [(ngModel)]="profile_name"
                      required /></label
                  ><label
                    >Teléfono<input name="phone" [(ngModel)]="profile_phone" required
                  /></label>
                </div>
                <label
                  >Distrito<select name="zone" [(ngModel)]="profile_zone" required>
                    @for (item of zones; track item) {
                      <option [value]="item">{{ item }}</option>
                    }
                  </select></label
                >
                @if (user.role === 'professional') {
                  @if (own_professional(); as pro) {
                    <div class="media-editor">
                      <div class="media-avatar">
                        @if (pro.photo_url) {
                          <img [src]="pro.photo_url" alt="Tu foto de perfil" />
                        } @else {
                          {{ initials(pro.full_name) }}
                        }
                      </div>
                      <label class="media-upload"
                        >Foto de perfil
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          (change)="upload_media($event, 'avatar')"
                        />
                        <small>Elige una imagen de hasta 5 MB.</small>
                      </label>
                    </div>
                    <div class="portfolio-editor">
                      <strong>Portafolio de trabajos</strong>
                      <p>Muestra hasta 6 fotos de trabajos realizados.</p>
                      @if (pro.portfolio.length) {
                        <div class="portfolio-grid">
                          @for (photo of pro.portfolio; track photo) {
                            <img [src]="photo" alt="Foto de tu portafolio" />
                          }
                        </div>
                      }
                      <label class="media-upload"
                        >Agregar foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          (change)="upload_media($event, 'portfolio')"
                        />
                      </label>
                    </div>
                  }
                  <div class="form-two">
                    <label
                      >Especialidad<select name="specialty" [(ngModel)]="profile_specialty">
                        @for (item of specialties; track item) {
                          <option [value]="item">{{ item }}</option>
                        }
                      </select></label
                    ><label
                      >Años de experiencia<input
                        name="experience"
                        type="number"
                        min="0"
                        max="70"
                        [(ngModel)]="profile_experience"
                    /></label>
                  </div>
                  <label
                    >Sobre mi trabajo<textarea
                      name="bio"
                      rows="4"
                      [(ngModel)]="profile_bio"
                    ></textarea></label
                  ><label class="inline-check"
                    ><input name="available" type="checkbox" [(ngModel)]="profile_available" />
                    Disponible para nuevas solicitudes</label
                  >
                }
                @if (error) {
                  <p class="form-error" role="alert">{{ error }}</p>
                }
                <button class="button button-primary" type="submit">Guardar cambios ↗</button>
              </form>
            }
          </div>
        </div>
      </section>
    } @else {
      <section class="container empty-page">
        <h1>Tu espacio te espera</h1>
        <p>Inicia sesión para ver solicitudes, cotizaciones y servicios.</p>
        <a class="button button-primary" routerLink="/ingresar">Ingresar ↗</a>
      </section>
    }
  `,
})
export class DashboardPage {
  readonly market = inject(Marketplace);
  readonly zones = ZONES;
  readonly specialties = SPECIALTIES;
  tab = 'overview';
  error = '';
  profile_name = '';
  profile_phone = '';
  profile_zone = '';
  profile_specialty = '';
  profile_experience = 0;
  profile_bio = '';
  profile_available = true;
  own_professional(): Professional | undefined {
    return this.market.professionals().find((item) => item.id === this.market.user()?.id);
  }
  initials(value: string): string {
    return value
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  async upload_media(event: Event, kind: 'avatar' | 'portfolio'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error = '';
    try {
      await this.market.upload_profile_media(file, kind);
      this.market.toast.set('Imagen guardada en tu perfil');
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      input.value = '';
    }
  }
  first_name(value: string): string {
    return value.split(' ')[0];
  }
  date(value: string): string {
    return new Date(value).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  status_label(value: string): string {
    return (
      (
        {
          REQUESTED: 'Nueva',
          QUOTED: 'Cotizada',
          ACCEPTED: 'Aceptada',
          COMPLETED: 'Completada',
          CANCELLED: 'Cancelada',
          DISPUTED: 'En revisión',
        } as Record<string, string>
      )[value] ?? value
    );
  }
  visible_requests(user: Profile): ServiceRequest[] {
    if (user.role === 'client')
      return this.market.requests().filter((item) => item.client_id === user.id);
    const specialty = this.market.professionals().find((item) => item.id === user.id)?.specialty;
    return this.market
      .requests()
      .filter(
        (item) =>
          item.status !== 'COMPLETED' &&
          item.status !== 'CANCELLED' &&
          item.status !== 'DISPUTED' &&
          (item.professional_id === user.id ||
            (!item.professional_id && item.specialty === specialty)),
      );
  }
  my_quotes(user: Profile): Quote[] {
    return this.market
      .quotes()
      .filter((item) =>
        user.role === 'professional'
          ? item.professional_id === user.id
          : this.market
              .requests()
              .some((request) => request.id === item.request_id && request.client_id === user.id),
      );
  }
  my_services(user: Profile): Service[] {
    return this.market
      .services()
      .filter((item) => item.client_id === user.id || item.professional_id === user.id);
  }
  my_notices(user: Profile) {
    return this.market.notices().filter((item) => item.user_id === user.id);
  }
  my_incidents(user: Profile): Incident[] {
    return this.market.incidents().filter((item) => item.reporter_id === user.id);
  }
  request_for(id: string): ServiceRequest | undefined {
    return this.market.requests().find((item) => item.id === id);
  }
  request_for_service(service_id: string): ServiceRequest | undefined {
    const service = this.market.services().find((item) => item.id === service_id);
    return service ? this.request_for(service.request_id) : undefined;
  }
  incident_status(value: string): string {
    return (
      (
        {
          OPEN: 'Abierta',
          IN_REVIEW: 'En revisión',
          RESOLVED: 'Resuelta',
          CLOSED: 'Cerrada',
        } as Record<string, string>
      )[value] ?? value
    );
  }
  open_profile(): void {
    const user = this.market.user();
    if (!user) return;
    this.tab = 'profile';
    this.profile_name = user.full_name;
    this.profile_phone = user.phone;
    this.profile_zone = user.zone;
    const pro = this.market.professionals().find((item) => item.id === user.id);
    if (pro) {
      this.profile_specialty = pro.specialty;
      this.profile_experience = pro.experience_years;
      this.profile_bio = pro.bio;
      this.profile_available = pro.available;
    }
  }
  async save_profile(): Promise<void> {
    const user = this.market.user();
    if (!user) return;
    this.error = '';
    try {
      await this.market.save_profile(
        {
          ...user,
          full_name: this.profile_name,
          phone: this.profile_phone,
          zone: this.profile_zone,
        },
        user.role === 'professional'
          ? {
              specialty: this.profile_specialty,
              experience_years: this.profile_experience,
              bio: this.profile_bio,
              available: this.profile_available,
            }
          : undefined,
      );
      this.market.toast.set('Perfil actualizado');
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    }
  }
}

@Component({
  selector: 'app-request-detail',
  imports: [FormsModule, RouterLink],
  template: `
    @if (request(); as request) {
      <section class="detail-top">
        <div class="container">
          <a class="back-link" routerLink="/panel">← Volver a mi espacio</a>
          <div class="detail-title-row">
            <div>
              <div class="eyebrow">SOLICITUD DE {{ request.specialty.toUpperCase() }}</div>
              <h1>{{ request.title }}</h1>
              <p>◉ {{ request.zone }} · Publicada {{ date(request.created_at) }}</p>
            </div>
            <span
              class="status-pill"
              [class]="'status-pill status-' + request.status.toLowerCase()"
              >{{ status_label(request.status) }}</span
            >
          </div>
        </div>
      </section>
      <section class="detail-content">
        <div class="container detail-grid">
          <div>
            <div class="surface-card detail-description">
              <h2>Sobre este trabajo</h2>
              <p>{{ request.description }}</p>
              <div class="detail-facts">
                <div>
                  <span>UBICACIÓN</span><strong>{{ request.address }}, {{ request.zone }}</strong>
                </div>
                <div>
                  <span>CUÁNDO</span
                  ><strong>{{
                    request.urgent
                      ? 'Lo antes posible'
                      : request.scheduled_at
                        ? date(request.scheduled_at)
                        : 'Fecha flexible'
                  }}</strong>
                </div>
              </div>
              @if (request.photos.length) {
                <h3>Fotos adjuntas</h3>
                <div class="photo-grid">
                  @for (photo of request.photos; track photo) {
                    <img [src]="photo" alt="Foto del trabajo solicitada por el cliente" />
                  }
                </div>
              }
            </div>
            @if (service(); as service) {
              <div class="surface-card progress-card">
                <h2>Seguimiento del servicio</h2>
                @if (service.status === 'QUOTED') {
                  <p class="success-note">
                    Hay un precio actualizado pendiente de tu aprobación. La versión anterior se
                    conserva en el historial.
                  </p>
                } @else {
                  <div class="progress-steps">
                    <div class="done"><b>✓</b><span>Solicitud publicada</span></div>
                    <div class="done"><b>✓</b><span>Cotización aceptada</span></div>
                    <div [class.done]="service.on_the_way || service.status === 'COMPLETED'">
                      <b>{{ service.on_the_way || service.status === 'COMPLETED' ? '✓' : '3' }}</b
                      ><span>Maestro en camino</span>
                    </div>
                    <div [class.done]="service.status === 'COMPLETED'">
                      <b>{{ service.status === 'COMPLETED' ? '✓' : '4' }}</b
                      ><span>Servicio completado</span>
                    </div>
                  </div>
                }
                @if (service.status === 'ACCEPTED') {
                  <div class="service-actions">
                    @if (market.user()?.id === service.professional_id) {
                      <button
                        class="button button-outline"
                        type="button"
                        [disabled]="service.on_the_way || working"
                        (click)="update_service(service, 'on_the_way')"
                      >
                        {{ service.on_the_way ? 'Ya estás en camino' : 'Marcar en camino' }}</button
                      ><button
                        class="button button-primary"
                        type="button"
                        [disabled]="working"
                        (click)="update_service(service, 'complete')"
                      >
                        Marcar completado ✓
                      </button>
                    }
                    @if (market.user()?.id === service.client_id) {
                      <button
                        class="link-button"
                        type="button"
                        [disabled]="working"
                        (click)="update_service(service, 'cancel')"
                      >
                        Cancelar servicio
                      </button>
                    }
                  </div>
                }
                @if (service.status === 'QUOTED' && market.user()?.id === service.client_id) {
                  <button
                    class="link-button"
                    type="button"
                    [disabled]="working"
                    (click)="update_service(service, 'cancel')"
                  >
                    Cancelar servicio
                  </button>
                }
                @if (service.status === 'COMPLETED' && !has_review(service)) {
                  <div class="review-form">
                    <h3>¿Cómo fue tu experiencia?</h3>
                    <p>Tu opinión ayuda a otros a elegir con confianza.</p>
                    <div class="rating-pick">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <button
                          type="button"
                          [class.active]="star <= rating"
                          (click)="rating = star"
                          [attr.aria-label]="star + ' estrellas'"
                        >
                          ★
                        </button>
                      }
                    </div>
                    <label
                      >Tu reseña<textarea
                        name="comment"
                        [(ngModel)]="comment"
                        rows="3"
                        placeholder="Cuéntanos cómo fue el trabajo"
                      ></textarea></label
                    ><button
                      class="button button-primary"
                      type="button"
                      [disabled]="working || !comment.trim()"
                      (click)="add_review(service)"
                    >
                      Publicar reseña ↗
                    </button>
                  </div>
                }
                @if (service.status === 'COMPLETED' && has_review(service)) {
                  <p class="success-note">✓ Gracias por compartir tu experiencia.</p>
                }
                <details class="incident-details">
                  <summary>¿Tuviste algún problema? Reportar incidencia</summary>
                  <p>Cuéntanos qué pasó. El equipo revisará el caso por correo o WhatsApp.</p>
                  <textarea
                    [(ngModel)]="incident_text"
                    rows="3"
                    placeholder="Describe el problema"
                  ></textarea
                  ><button
                    class="button button-outline"
                    type="button"
                    [disabled]="!incident_text.trim() || working"
                    (click)="report(service)"
                  >
                    Enviar reporte
                  </button>
                </details>
              </div>
            }
          </div>
          <aside>
            @if (can_show_contact()) {
              <div class="surface-card service-contact">
                <h2>Datos para coordinar</h2>
                @if (contact_state() === 'ready' && contact(); as person) {
                  <p><strong>{{ person.full_name }}</strong></p>
                  <p>Teléfono: <a [href]="'tel:' + person.phone">{{ person.phone }}</a></p>
                  <small>Coordinen directamente la visita por llamada o WhatsApp.</small>
                } @else if (contact_state() === 'loading') {
                  <p>Obteniendo contacto...</p>
                } @else if (contact_state() === 'denied') {
                  <p>Los datos de contacto no están disponibles para esta cotización.</p>
                } @else if (contact_state() === 'error') {
                  <p role="alert">No se pudo cargar el contacto. Vuelve a abrir esta solicitud.</p>
                }
              </div>
            }
            <div class="surface-card quote-panel">
              <span class="aside-icon">✦</span>
              <h2>
                {{
                  market.user()?.role === 'professional'
                    ? 'Envía tu propuesta'
                    : 'Cotizaciones recibidas'
                }}
              </h2>
              @if (market.user()?.role === 'professional' && can_quote(request)) {
                <p>Propón un precio y explica qué incluye tu trabajo.</p>
                <form (ngSubmit)="send_quote(request)">
                  <label
                    >Precio en soles (S/)<input
                      name="price"
                      type="number"
                      min="1"
                      step="0.01"
                      [(ngModel)]="price"
                      required
                      placeholder="Ej. 85" /></label
                  ><label
                    >¿Qué incluye?<textarea
                      name="quote_description"
                      rows="3"
                      [(ngModel)]="quote_description"
                      required
                      placeholder="Describe el trabajo propuesto"
                    ></textarea></label
                  ><label
                    >Observaciones (opcional)<textarea
                      name="notes"
                      rows="2"
                      [(ngModel)]="notes"
                    ></textarea></label
                  ><button
                    class="button button-primary button-full"
                    [disabled]="working"
                    type="submit"
                  >
                    Enviar cotización ↗
                  </button>
                </form>
              }
              @for (quote of quotes_for(request.id); track quote.id) {
                <div class="quote-item">
                  <div>
                    <strong>{{ professional_name(quote.professional_id) }}</strong
                    ><span class="quote-status">{{
                      quote.status === 'PENDING'
                        ? 'Por responder'
                        : quote.status === 'ACCEPTED'
                          ? 'Aceptada'
                          : quote.status === 'SUPERSEDED'
                            ? 'Versión anterior'
                            : 'Rechazada'
                    }}</span>
                  </div>
                  <small>Versión {{ quote.version }} · {{ date(quote.created_at) }}</small
                  ><b>S/ {{ quote.price }}</b>
                  <p>{{ quote.description }}</p>
                  @if (quote.notes) {
                    <small>{{ quote.notes }}</small>
                  }
                  @if (
                    market.user()?.id === request.client_id &&
                    quote.status === 'PENDING' &&
                    (!service() || service()?.status === 'QUOTED')
                  ) {
                    <div class="quote-actions">
                      <button
                        type="button"
                        class="button button-primary"
                        [disabled]="working"
                        (click)="decide(quote, true)"
                      >
                        Aceptar ↗</button
                      ><button
                        type="button"
                        class="button button-outline"
                        [disabled]="working"
                        (click)="decide(quote, false)"
                      >
                        Rechazar
                      </button>
                    </div>
                  }
                </div>
              } @empty {
                <p class="muted">Aún no hay cotizaciones para esta solicitud.</p>
              }
            </div>
            @if (market.user()?.role === 'client') {
              <div class="surface-card tip-card">
                <strong>💡 Consejo</strong>
                <p>
                  Revisa el alcance y precio antes de aceptar. Si cambia el precio, el maestro debe
                  enviar una nueva versión.
                </p>
              </div>
            }
          </aside>
        </div>
        @if (error) {
          <div class="container">
            <p class="form-error" role="alert">{{ error }}</p>
          </div>
        }
      </section>
    } @else {
      <section class="container empty-page">
        <h1>Solicitud no encontrada</h1>
        <a routerLink="/panel">Volver a mi espacio →</a>
      </section>
    }
  `,
})
export class RequestDetailPage {
  readonly market = inject(Marketplace);
  readonly route = inject(ActivatedRoute);
  readonly contact = signal<AcceptedContact | null>(null);
  readonly contact_state = signal<'idle' | 'loading' | 'ready' | 'denied' | 'error'>('idle');
  private contact_key = '';

  constructor() {
    effect(() => {
      const service = this.service();
      const user = this.market.user();
      if (!service || !user || !this.can_show_contact()) {
        this.contact_key = '';
        this.contact.set(null);
        this.contact_state.set('idle');
        return;
      }
      const key = `${service.request_id}:${service.quote_id}:${user.id}`;
      if (key === this.contact_key) return;
      this.contact_key = key;
      this.contact.set(null);
      this.contact_state.set('loading');
      void this.market.get_accepted_contact(service.request_id).then((person) => {
        if (this.contact_key !== key) return;
        this.contact.set(person);
        this.contact_state.set(person ? 'ready' : 'denied');
      }).catch(() => {
        if (this.contact_key !== key) return;
        this.contact.set(null);
        this.contact_state.set('error');
      });
    });
  }

  can_show_contact(): boolean {
    const service = this.service();
    const user = this.market.user();
    return !this.market.is_demo && !!service && !!user
      && (service.status === 'ACCEPTED' || service.status === 'COMPLETED'
        || service.status === 'DISPUTED')
      && (user.id === service.client_id || user.id === service.professional_id)
      && this.market.quotes().some((quote) => quote.id === service.quote_id
        && quote.status === 'ACCEPTED');
  }
  price = 0;
  quote_description = '';
  notes = '';
  rating = 5;
  comment = '';
  incident_text = '';
  error = '';
  working = false;
  request(): ServiceRequest | undefined {
    return this.market
      .requests()
      .find((item) => item.id === this.route.snapshot.paramMap.get('id'));
  }
  service(): Service | undefined {
    return this.market
      .services()
      .find((item) => item.request_id === this.route.snapshot.paramMap.get('id'));
  }
  quotes_for(id: string): Quote[] {
    const user = this.market.user();
    return this.market
      .quotes()
      .filter(
        (item) =>
          item.request_id === id && (user?.role === 'client' || item.professional_id === user?.id),
      );
  }
  can_quote(request: ServiceRequest): boolean {
    const user = this.market.user();
    const pro = this.market.professionals().find((item) => item.id === user?.id);
    return (
      !!user &&
      !!pro &&
      (request.professional_id === user.id ||
        (!request.professional_id && request.specialty === pro.specialty)) &&
      (request.status === 'REQUESTED' ||
        request.status === 'QUOTED' ||
        request.status === 'ACCEPTED')
    );
  }
  professional_name(id: string): string {
    return this.market.professionals().find((item) => item.id === id)?.full_name ?? 'Maestro';
  }
  has_review(service: Service): boolean {
    return this.market
      .reviews()
      .some(
        (item) => item.service_id === service.id && item.reviewer_id === this.market.user()?.id,
      );
  }
  date(value: string): string {
    return new Date(value).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  status_label(value: string): string {
    return (
      (
        {
          REQUESTED: 'Nueva',
          QUOTED: 'Cotizada',
          ACCEPTED: 'Aceptada',
          COMPLETED: 'Completada',
          CANCELLED: 'Cancelada',
          DISPUTED: 'En revisión',
        } as Record<string, string>
      )[value] ?? value
    );
  }
  private async run(action: () => Promise<void>): Promise<void> {
    this.error = '';
    this.working = true;
    try {
      await action();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.working = false;
    }
  }
  async send_quote(request: ServiceRequest): Promise<void> {
    await this.run(async () => {
      await this.market.send_quote(request, this.price, this.quote_description, this.notes);
      this.market.toast.set('Cotización enviada');
      this.price = 0;
      this.quote_description = '';
      this.notes = '';
    });
  }
  async decide(quote: Quote, accept: boolean): Promise<void> {
    await this.run(async () => {
      await this.market.decide_quote(quote, accept);
      this.market.toast.set(accept ? 'Cotización aceptada' : 'Cotización rechazada');
    });
  }
  async update_service(
    service: Service,
    action: 'on_the_way' | 'complete' | 'cancel' | 'dispute',
  ): Promise<void> {
    await this.run(async () => {
      await this.market.update_service(service, action);
      this.market.toast.set('Estado del servicio actualizado');
    });
  }
  async add_review(service: Service): Promise<void> {
    await this.run(async () => {
      await this.market.add_review(service, this.rating, this.comment);
      this.market.toast.set('Reseña publicada');
    });
  }
  async report(service: Service): Promise<void> {
    await this.run(async () => {
      await this.market.report_incident(service, this.incident_text);
      this.market.toast.set('Reporte enviado');
      this.incident_text = '';
    });
  }
}
