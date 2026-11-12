import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  AfterViewChecked,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { Marketplace } from './marketplace';
import { Professional, SPECIALTIES, ZONES } from './models';

@Component({
  selector: 'app-explore',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page-hero explore-hero">
      <div class="container">
        <div class="eyebrow">MAESTROS CERCA DE TI</div>
        <h1>Encuentra a la persona <em>indicada.</em></h1>
        <p>Explora profesionales de Arequipa y elige con información clara.</p>
      </div>
    </section>
    <section class="explore-content">
      <div class="container">
        <div class="filter-bar">
          <label
            >¿Qué necesitas?<select [(ngModel)]="specialty" (ngModelChange)="refresh()">
              <option value="">Todas las especialidades</option>
              @for (item of specialties; track item) {
                <option [value]="item">{{ item }}</option>
              }
            </select></label
          ><label
            >Tu zona<select [(ngModel)]="zone" (ngModelChange)="refresh()">
              <option value="">Toda Arequipa</option>
              @for (item of zones; track item) {
                <option [value]="item">{{ item }}</option>
              }
            </select></label
          ><label class="filter-check"
            ><input type="checkbox" [(ngModel)]="available_only" (ngModelChange)="refresh()" /><span
              >Disponibles ahora</span
            ></label
          >
        </div>
        <div class="results-heading">
          <div>
            <h2>
              {{ filtered().length }} {{ filtered().length === 1 ? 'maestro' : 'maestros' }} para ti
            </h2>
            <p>Ordenados por calificaciones y trabajos realizados</p>
          </div>
          <span>★ Opiniones de servicios completados</span>
        </div>
        @if (search_error()) {
          <p class="form-error" role="alert">{{ search_error() }}</p>
        }
        @if (loading()) {
          <p role="status">Buscando maestros...</p>
        }
        <div class="explore-grid">
          @for (pro of filtered(); track pro.id) {
            <a class="list-pro-card" [routerLink]="['/profesional', pro.id]"
              ><div class="list-pro-avatar" [class]="avatar_color(pro.specialty)">
                @if (pro.photo_url) {
                  <img [src]="pro.photo_url" [alt]="pro.full_name" />
                } @else {
                  {{ initials(pro.full_name) }}
                }
              </div>
              <div class="list-pro-main">
                <div class="list-pro-name">
                  <h3>{{ pro.full_name }}</h3>
                  @if (pro.available) {
                    <span class="available-pill">● Disponible</span>
                  }
                </div>
                <p class="list-pro-specialty">{{ pro.specialty }} · {{ pro.zone }}</p>
                <p class="list-pro-bio">{{ pro.bio }}</p>
                <div class="list-pro-tags">
                  <span>{{ pro.experience_years }} años de experiencia</span
                  ><span>{{ pro.completed_count }} trabajos</span>
                </div>
              </div>
              <div class="list-pro-rating">
                <strong>★ {{ pro.rating }}</strong
                ><small>Ver perfil ↗</small>
              </div></a
            >
          } @empty {
            @if (!loading()) {
              <div class="empty-state">
                <span>⌕</span>
                <h3>No encontramos maestros con esos filtros</h3>
                <p>Prueba otra especialidad o zona para ver más opciones.</p>
                <button class="button button-dark" type="button" (click)="reset()">
                  Limpiar filtros
                </button>
              </div>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class ExplorePage {
  readonly market = inject(Marketplace);
  readonly route = inject(ActivatedRoute);
  readonly specialties = SPECIALTIES;
  readonly zones = ZONES;
  specialty = this.route.snapshot.queryParamMap.get('especialidad') ?? '';
  zone = '';
  available_only = false;
  results = signal<Professional[]>([]);
  search_error = signal('');
  loading = signal(false);
  constructor() {
    void this.refresh();
  }
  filtered(): Professional[] {
    return this.market.is_demo
      ? this.market
          .professionals()
          .filter(
            (item) =>
              (!this.specialty || item.specialty === this.specialty) &&
              (!this.zone || item.zone === this.zone) &&
              (!this.available_only || item.available),
          )
          .sort((a, b) => b.rating - a.rating || b.completed_count - a.completed_count)
      : this.results();
  }
  async refresh(): Promise<void> {
    this.search_error.set('');
    this.loading.set(true);
    try {
      this.results.set(
        await this.market.search_professionals(this.specialty, this.zone, this.available_only),
      );
    } catch (error) {
      this.search_error.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.loading.set(false);
    }
  }
  reset(): void {
    this.specialty = '';
    this.zone = '';
    this.available_only = false;
    void this.refresh();
  }
  initials(value: string): string {
    return value
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  avatar_color(value: string): string {
    return value === 'Gasfitería'
      ? 'avatar-mint'
      : value === 'Electricidad'
        ? 'avatar-peach'
        : 'avatar-lavender';
  }
}

@Component({
  selector: 'app-professional',
  imports: [RouterLink],
  template: `
    @if (professional(); as pro) {
      <section class="profile-cover">
        <div class="container">
          <a routerLink="/explorar" class="back-link">← Volver a maestros</a>
          <div class="profile-head">
            <div class="profile-big-avatar">
              @if (pro.photo_url) {
                <img [src]="pro.photo_url" [alt]="pro.full_name" />
              } @else {
                {{ initials(pro.full_name) }}
              }
            </div>
            <div>
              <div class="eyebrow eyebrow-light">PROFESIONAL DE MANOCERCA</div>
              <h1>{{ pro.full_name }}</h1>
              <p>{{ pro.specialty }} · {{ pro.zone }}, Arequipa</p>
            </div>
            <div class="profile-head-rating">
              ★ {{ pro.rating }}<small>{{ pro.completed_count }} trabajos completados</small>
            </div>
          </div>
        </div>
      </section>
      <section class="profile-content">
        <div class="container profile-grid">
          <div>
            <div class="surface-card">
              <div class="profile-tags">
                <span>✦ {{ pro.experience_years }} años de experiencia</span>
                @if (pro.available) {
                  <span class="available-pill">● Disponible</span>
                }
              </div>
              <h2>Sobre mí</h2>
              <p>{{ pro.bio }}</p>
              <h2>Mi trabajo</h2>
              <p>
                Trabajo en {{ pro.zone }} y zonas cercanas de Arequipa. Envíame una solicitud con
                los detalles para preparar una propuesta clara.
              </p>
              <div class="profile-metrics">
                <div>
                  <strong>{{ pro.completed_count }}</strong
                  ><small>trabajos terminados</small>
                </div>
                <div>
                  <strong>{{ pro.rating }}</strong
                  ><small>calificación</small>
                </div>
                <div>
                  <strong>{{ pro.experience_years }}</strong
                  ><small>años de oficio</small>
                </div>
              </div>
              @if (pro.portfolio.length) {
                <h2 class="portfolio-heading">Trabajos recientes</h2>
                <div class="portfolio-grid">
                  @for (photo of pro.portfolio; track photo) {
                    <img [src]="photo" alt="Trabajo realizado por el profesional" />
                  }
                </div>
              }
            </div>
            <div class="surface-card review-section">
              <h2>Opiniones de clientes</h2>
              @for (review of reviews_for(pro.id); track review.id) {
                <div class="review-item">
                  <div>
                    <span class="stars">{{ stars(review.rating) }}</span
                    ><small>{{ review.created_at.slice(0, 10) }}</small>
                  </div>
                  <p>“{{ review.comment }}”</p>
                </div>
              } @empty {
                <p>
                  Aún no hay reseñas visibles. Los clientes podrán calificar después de completar un
                  servicio.
                </p>
              }
            </div>
          </div>
          <aside class="surface-card contact-card">
            <div class="contact-icon">✳</div>
            <h2>¿Te puede ayudar {{ first_name(pro.full_name) }}?</h2>
            <p>Cuéntale qué necesitas y recibe una cotización sin compromiso.</p>
            <a
              class="button button-primary button-full"
              routerLink="/solicitar"
              [queryParams]="{ maestro: pro.id }"
              >Solicitar cotización ↗</a
            ><small>El precio se acuerda antes de iniciar el trabajo.</small>
          </aside>
        </div>
      </section>
    } @else {
      <section class="container empty-page">
        <h1>Profesional no encontrado</h1>
        <a routerLink="/explorar">Explorar maestros →</a>
      </section>
    }
  `,
})
export class ProfessionalPage {
  readonly market = inject(Marketplace);
  readonly route = inject(ActivatedRoute);
  professional(): Professional | undefined {
    return this.market
      .professionals()
      .find((item) => item.id === this.route.snapshot.paramMap.get('id'));
  }
  reviews_for(id: string) {
    return this.market.reviews().filter((item) => item.reviewee_id === id);
  }
  initials(value: string): string {
    return value
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  first_name(value: string): string {
    return value.split(' ')[0];
  }
  stars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="container auth-grid">
        <div class="auth-intro">
          <div class="eyebrow">BIENVENIDO A MANOCERCA</div>
          <h1>
            {{ is_register ? 'Tu hogar y tu oficio, más cerca.' : 'Qué bueno verte de nuevo.' }}
          </h1>
          <p>
            {{
              is_register
                ? 'Únete a una comunidad local donde encontrar ayuda y ofrecer tu trabajo es mucho más fácil.'
                : 'Entra a tu espacio para continuar donde lo dejaste.'
            }}
          </p>
          <div class="auth-art">
            <div class="auth-art-house">⌂</div>
            <span>Una mano cerca<br />hace la diferencia.</span><b>✳</b>
          </div>
        </div>
        <div class="auth-card">
          <div class="auth-card-top">
            <h2>{{ is_register ? 'Crear una cuenta' : 'Iniciar sesión' }}</h2>
            <p>
              {{
                is_register
                  ? 'Comencemos con algunos datos básicos.'
                  : 'Ingresa tus datos para continuar.'
              }}
            </p>
          </div>
          <div class="role-selector">
            <button type="button" [class.selected]="role === 'client'" (click)="role = 'client'">
              ⌂ Soy cliente</button
            ><button
              type="button"
              [class.selected]="role === 'professional'"
              (click)="role = 'professional'"
            >
              ✳ Soy maestro
            </button>
          </div>
          <form (ngSubmit)="submit()">
            @if (is_register) {
              <label
                >Nombre completo<input
                  name="full_name"
                  [(ngModel)]="full_name"
                  required
                  placeholder="Tu nombre y apellido"
              /></label>
              <div class="form-two">
                <label
                  >Teléfono<input
                    name="phone"
                    [(ngModel)]="phone"
                    required
                    placeholder="999 999 999" /></label
                ><label
                  >Distrito<select name="zone" [(ngModel)]="zone" required>
                    <option value="">Selecciona uno</option>
                    @for (item of zones; track item) {
                      <option [value]="item">{{ item }}</option>
                    }
                  </select></label
                >
              </div>
              @if (role === 'professional') {
                <label
                  >Especialidad<select name="specialty" [(ngModel)]="specialty" required>
                    <option value="">¿A qué te dedicas?</option>
                    @for (item of specialties; track item) {
                      <option [value]="item">{{ item }}</option>
                    }
                  </select></label
                >
              }
            }
            <label
              >Correo electrónico<input
                name="email"
                type="email"
                [(ngModel)]="email"
                required
                placeholder="tu@correo.com" /></label
            ><label
              >Contraseña<input
                name="password"
                type="password"
                [(ngModel)]="password"
                required
                minlength="6"
                placeholder="Mínimo 6 caracteres"
            /></label>
            @if (error) {
              <p class="form-error" role="alert">{{ error }}</p>
            }
            @if (message) {
              <p class="form-success" role="status">{{ message }}</p>
            }
            <button class="button button-primary button-full" type="submit" [disabled]="working">
              {{ working ? 'Un momento...' : is_register ? 'Crear mi cuenta ↗' : 'Ingresar ↗' }}
            </button>
          </form>
          @if (!is_register) {
            <p class="auth-switch"><a routerLink="/recuperar-contrasena">Olvidé mi contraseña</a></p>
          }
          <p class="auth-switch">
            {{ is_register ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?' }}
            <a
              [routerLink]="is_register ? '/ingresar' : '/registro'"
              [queryParams]="{ rol: role }"
              >{{ is_register ? 'Inicia sesión' : 'Regístrate gratis' }}</a
            >
          </p>
          @if (market.is_demo) {
            <div class="demo-auth">
              <span>O prueba el MVP al instante</span>
              <div>
                <button type="button" (click)="enter_demo('client')">Entrar como cliente →</button
                ><button type="button" (click)="enter_demo('professional')">
                  Entrar como maestro →
                </button>
              </div>
              <small>Los datos de demostración se guardan solo en este navegador.</small>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AuthPage {
  readonly market = inject(Marketplace);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly zones = ZONES;
  readonly specialties = SPECIALTIES;
  is_register = this.router.url.startsWith('/registro');
  role: 'client' | 'professional' =
    this.route.snapshot.queryParamMap.get('rol') === 'professional' ? 'professional' : 'client';
  full_name = '';
  phone = '';
  zone = '';
  specialty = '';
  email = '';
  password = '';
  error = '';
  message = '';
  working = false;
  async submit(): Promise<void> {
    this.error = '';
    this.message = '';
    this.working = true;
    try {
      if (this.is_register) {
        const result = await this.market.register(
          this.role,
          this.full_name,
          this.email,
          this.password,
          this.phone,
          this.zone,
          this.specialty,
        );
        if (result === 'confirmation_required') {
          this.password = '';
          this.message = 'Cuenta creada. Revisa tu correo y confirma tu dirección antes de ingresar.';
          return;
        }
      } else await this.market.login(this.email, this.password, this.role);
      await this.router.navigateByUrl('/panel');
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.working = false;
    }
  }
  async enter_demo(role: 'client' | 'professional'): Promise<void> {
    this.market.demo_as(role);
    await this.router.navigateByUrl('/panel');
  }
}

@Component({
  selector: 'app-password-recovery',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="container auth-grid">
        <div class="auth-intro">
          <div class="eyebrow">TU CUENTA EN MANOCERCA</div>
          <h1>Recupera tu acceso.</h1>
          <p>Te enviaremos un enlace a tu correo para crear una nueva contraseña.</p>
        </div>
        <div class="auth-card">
          @if (updated) {
            <h2>Contraseña actualizada</h2>
            <p class="form-success" role="status">Ya puedes continuar en ManoCerca.</p>
            <a class="button button-primary button-full" routerLink="/panel">Ir a mi espacio ↗</a>
          } @else if (market.password_recovery()) {
            <h2>Crear nueva contraseña</h2>
            <p>Introduce una contraseña nueva para tu cuenta.</p>
            <form (ngSubmit)="save_password()">
              <label>Nueva contraseña<input name="password" type="password"
                [(ngModel)]="password" required minlength="6" autocomplete="new-password" /></label>
              <label>Confirmar contraseña<input name="confirmation" type="password"
                [(ngModel)]="confirmation" required minlength="6" autocomplete="new-password" /></label>
              @if (error) { <p class="form-error" role="alert">{{ error }}</p> }
              <button class="button button-primary button-full" type="submit" [disabled]="working">
                {{ working ? 'Un momento...' : 'Guardar contraseña ↗' }}
              </button>
            </form>
          } @else {
            <h2>Olvidé mi contraseña</h2>
            <p>Escribe el correo con el que te registraste.</p>
            <form (ngSubmit)="send_email()">
              <label>Correo electrónico<input name="email" type="email" [(ngModel)]="email"
                required autocomplete="email" placeholder="tu@correo.com" /></label>
              @if (error) { <p class="form-error" role="alert">{{ error }}</p> }
              @if (message) { <p class="form-success" role="status">{{ message }}</p> }
              <button class="button button-primary button-full" type="submit" [disabled]="working">
                {{ working ? 'Un momento...' : 'Enviar enlace ↗' }}
              </button>
            </form>
            <p class="auth-switch"><a routerLink="/ingresar">Volver a ingresar</a></p>
          }
        </div>
      </div>
    </section>
  `,
})
export class PasswordRecoveryPage {
  readonly market = inject(Marketplace);
  email = '';
  password = '';
  confirmation = '';
  error = new URLSearchParams(window.location.hash.slice(1)).has('error')
    ? 'El enlace venció o no es válido. Solicita uno nuevo.' : '';
  message = '';
  working = false;
  updated = false;

  async send_email(): Promise<void> {
    this.error = '';
    this.message = '';
    this.working = true;
    try {
      await this.market.request_password_reset(this.email.trim());
      this.message = 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación.';
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.working = false;
    }
  }

  async save_password(): Promise<void> {
    this.error = '';
    if (this.password !== this.confirmation) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    this.working = true;
    try {
      await this.market.update_password(this.password);
      this.password = '';
      this.confirmation = '';
      this.updated = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.working = false;
    }
  }
}

@Component({
  selector: 'app-request-form',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page-hero request-hero">
      <div class="container">
        <div class="eyebrow">CUÉNTANOS QUÉ NECESITAS</div>
        <h1>Empecemos por <em>tu proyecto.</em></h1>
        <p>Unos detalles ayudan a que los maestros preparen una mejor propuesta.</p>
      </div>
    </section>
    <section class="form-page">
      <div class="container form-layout">
        <div class="surface-card form-main">
          @if (!market.user() || market.user()?.role !== 'client') {
            <div class="form-gate">
              <span>⌂</span>
              <h2>Primero, entra como cliente</h2>
              <p>Así podremos guardar tu solicitud y mostrarte las cotizaciones que recibas.</p>
              <a
                class="button button-primary"
                routerLink="/ingresar"
                [queryParams]="{ rol: 'client' }"
                >Ingresar o crear cuenta ↗</a
              >
              @if (market.is_demo) {
                <button type="button" class="link-button" (click)="market.demo_as('client')">
                  Probar como cliente ahora →
                </button>
              }
            </div>
          } @else {
            <form (ngSubmit)="submit()">
              <div class="form-step">
                <span>01</span>
                <div>
                  <h2>¿Qué hay que hacer?</h2>
                  <p>Cuéntanos lo más importante del trabajo.</p>
                </div>
              </div>
              <div class="form-two">
                <label
                  >Tipo de servicio<select name="specialty" [(ngModel)]="specialty" required>
                    <option value="">Selecciona una especialidad</option>
                    @for (item of specialties; track item) {
                      <option [value]="item">{{ item }}</option>
                    }
                  </select></label
                ><label
                  >Título de tu solicitud<input
                    name="title"
                    [(ngModel)]="title"
                    required
                    minlength="3"
                    maxlength="90"
                    placeholder="Ej. Reparar fuga en la cocina"
                /></label>
              </div>
              <label
                >Describe el trabajo<textarea
                  name="description"
                  [(ngModel)]="description"
                  required
                  rows="4"
                  minlength="10"
                  maxlength="1200"
                  placeholder="¿Qué sucede? ¿Hay algún detalle que el maestro deba saber?"
                ></textarea>
              </label>
              <div class="form-step step-gap">
                <span>02</span>
                <div>
                  <h2>¿Dónde será?</h2>
                  <p>Marca el punto aproximado para encontrar maestros cercanos.</p>
                </div>
              </div>
              <div class="form-two">
                <label
                  >Distrito<select name="zone" [(ngModel)]="zone" required>
                    <option value="">Selecciona un distrito</option>
                    @for (item of zones; track item) {
                      <option [value]="item">{{ item }}</option>
                    }
                  </select></label
                ><label
                  >Dirección o referencia<input
                    name="address"
                    [(ngModel)]="address"
                    required
                    placeholder="Calle, número o referencia"
                /></label>
              </div>
              <div class="map-frame">
                <div #map class="request-map"></div>
                <div class="map-caption">◎ Toca el mapa para ajustar el pin de ubicación</div>
              </div>
              <div class="form-step step-gap">
                <span>03</span>
                <div>
                  <h2>Últimos detalles</h2>
                  <p>Agrega fotos y dinos cuándo te gustaría hacerlo.</p>
                </div>
              </div>
              <label class="upload-zone"
                ><input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  (change)="choose_files($event)"
                /><span>▧</span><strong>Agrega fotos del problema</strong
                ><small>Solo imágenes, hasta 5 MB cada una · Máximo 4 fotos</small></label
              >
              @if (files.length) {
                <div class="file-chips">
                  @for (file of files; track file.name) {
                    <span>▧ {{ file.name }}</span>
                  }
                </div>
              }
              <div class="urgency-options">
                <label
                  ><input type="radio" name="urgency" [value]="false" [(ngModel)]="urgent" /> Tengo
                  flexibilidad</label
                ><label
                  ><input type="radio" name="urgency" [value]="true" [(ngModel)]="urgent" /> Es
                  urgente</label
                >
              </div>
              @if (!urgent) {
                <label
                  >Fecha preferida (opcional)<input
                    type="date"
                    name="scheduled_at"
                    [(ngModel)]="scheduled_at"
                    [min]="today"
                /></label>
              }
              @if (error) {
                <p class="form-error" role="alert">{{ error }}</p>
              }
              <button class="button button-primary button-large" type="submit" [disabled]="working">
                {{ working ? 'Publicando...' : 'Publicar solicitud ↗' }}
              </button>
              <p class="form-disclaimer">
                Publicar es gratis. Tú decides si aceptas una cotización.
              </p>
            </form>
          }
        </div>
        <aside class="form-aside">
          <div class="surface-card">
            <span class="aside-icon">✦</span>
            <h3>Una buena descripción ayuda mucho</h3>
            <p>Indica qué sucede, desde cuándo y si hay alguna medida o material importante.</p>
          </div>
          <div class="surface-card">
            <span class="aside-icon">◎</span>
            <h3>Tú tienes la última palabra</h3>
            <p>Recibirás propuestas y podrás revisarlas antes de contratar.</p>
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class RequestFormPage implements AfterViewChecked, OnDestroy {
  readonly market = inject(Marketplace);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly specialties = SPECIALTIES;
  readonly zones = ZONES;
  @ViewChild('map') map_element?: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  private pin?: L.CircleMarker;
  specialty = '';
  title = '';
  description = '';
  address = '';
  zone = '';
  latitude = -16.3989;
  longitude = -71.535;
  urgent = false;
  scheduled_at = '';
  today = new Date().toISOString().slice(0, 10);
  files: File[] = [];
  error = '';
  working = false;
  professional_id = this.route.snapshot.queryParamMap.get('maestro');
  constructor() {
    const pro = this.market.professionals().find((item) => item.id === this.professional_id);
    if (pro) {
      this.specialty = pro.specialty;
      this.zone = pro.zone;
    }
  }
  ngAfterViewChecked(): void {
    if (!this.map_element || this.map) return;
    this.map = L.map(this.map_element.nativeElement).setView([this.latitude, this.longitude], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
    this.pin = L.circleMarker([this.latitude, this.longitude], {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#ed784e',
      fillOpacity: 1,
    }).addTo(this.map);
    this.map.on('click', (event) => {
      this.latitude = event.latlng.lat;
      this.longitude = event.latlng.lng;
      this.pin?.setLatLng(event.latlng);
    });
    setTimeout(() => this.map?.invalidateSize(), 50);
  }
  ngOnDestroy(): void {
    this.map?.remove();
  }
  choose_files(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selected = Array.from(target.files ?? []);
    if (
      selected.length > 4 ||
      selected.some(
        (file) =>
          !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      this.error = 'Selecciona hasta 4 imágenes de máximo 5 MB cada una.';
      target.value = '';
      return;
    }
    this.files = selected;
    this.error = '';
  }
  async submit(): Promise<void> {
    this.error = '';
    if (this.title.trim().length < 3) {
      this.error = 'El título debe tener al menos 3 caracteres.';
      return;
    }
    if (this.description.trim().length < 10) {
      this.error = 'La descripción debe tener al menos 10 caracteres.';
      return;
    }
    this.working = true;
    try {
      const request_id = await this.market.create_request(
        {
          professional_id: this.professional_id,
          specialty: this.specialty,
          title: this.title,
          description: this.description,
          address: this.address,
          zone: this.zone,
          latitude: this.latitude,
          longitude: this.longitude,
          urgent: this.urgent,
          scheduled_at: this.urgent ? null : this.scheduled_at || null,
        },
        this.files,
      );
      await this.router.navigate(['/solicitudes', request_id]);
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.working = false;
    }
  }
}
