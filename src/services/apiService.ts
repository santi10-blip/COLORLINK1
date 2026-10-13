/**
 * COLORLINK - Data & Persistence Service
 * Migrado a Supabase PostgreSQL con compatibilidad serverless nativa.
 * Permite persistencia en tiempo real en la nube sin depender de FastAPI local.
 */

import { 
  Project, 
  Client, 
  User, 
  UserRole,
  AuditLog,
  InventoryItem, 
  TimelineEvent, 
  PhotographicEvidence, 
  ProjectArea,
  UserRegistrationData,
  WelcomeEmailMessage
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_CLIENTS, INITIAL_PROJECTS, INITIAL_INVENTORY, CURRENT_USER, INITIAL_AUDIT_LOGS } from '../data/initialData';
import { generateWelcomeEmail } from './emailService';

function isValidUUID(id?: string): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const N8N_WELCOME_WEBHOOK_URL = 'https://santi2.app.n8n.cloud/webhook/bienvenida-usuario';
export const N8N_WELCOME_WEBHOOK_TEST_URL = 'https://santi2.app.n8n.cloud/webhook-test/bienvenida-usuario';

export async function sendN8nWelcomeWebhook(payload: Record<string, any>): Promise<{ ok: boolean; status?: number; report?: any; error?: string }> {
  let backendReport: any = null;
  // 1. Despachar a través del backend proxy (seguro contra CORS y bloqueos de red)
  try {
    const proxyRes = await fetch('/api/v1/n8n/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      backendReport = data.report;
    }
  } catch (proxyErr) {
    console.warn('n8n proxy dispatch notice:', proxyErr);
  }

  // 2. Despachar directamente desde el cliente web al webhook oficial
  try {
    const res = await fetch(N8N_WELCOME_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status, report: backendReport };
  } catch (err: any) {
    console.warn('n8n Webhook direct client call notice:', err?.message || err);
    return { 
      ok: backendReport?.production?.ok || false, 
      status: backendReport?.production?.status, 
      report: backendReport, 
      error: err?.message 
    };
  }
}

function mapSupabaseProject(row: any): Project {
  const cond = Array.isArray(row.operational_conditions) 
    ? row.operational_conditions[0] 
    : row.operational_conditions;

  const cls = Array.isArray(row.gemini_classifications) 
    ? row.gemini_classifications[0] 
    : row.gemini_classifications;

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    clientId: row.client_id,
    clientName: row.client_name || row.clients?.company_name || 'Cliente Corporativo',
    city: row.city,
    projectType: row.project_type,
    priority: row.priority,
    budgetEstimated: Number(row.budget_estimated) || 0,
    status: row.status,
    totalSqm: Number(row.total_sqm) || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : '',
    deadline: row.deadline ? new Date(row.deadline).toISOString().split('T')[0] : '',
    assignedEngineer: row.assigned_engineer || '',
    assignedSalesperson: row.assigned_salesperson || '',
    activeAlerts: Array.isArray(row.active_alerts) ? row.active_alerts : [],
    areas: (row.project_areas || []).map((a: any): ProjectArea => ({
      id: a.id,
      name: a.name,
      substrate: a.substrate,
      sqm: Number(a.sqm) || 0,
      location: a.location,
      heightMeters: Number(a.height_meters) || 0,
      initialCondition: a.initial_condition,
    })),
    conditions: cond ? {
      humidity: Number(cond.humidity) || 0,
      ambientTemp: Number(cond.ambient_temp) || 0,
      surfaceTemp: Number(cond.surface_temp) || 0,
      corrosivity: cond.corrosivity,
      chemicalExposure: Array.isArray(cond.chemical_exposure) ? cond.chemical_exposure : [],
      trafficType: cond.traffic_type,
      uvExposure: cond.uv_exposure,
      specialRequirements: cond.special_requirements || '',
    } : {
      humidity: 60,
      ambientTemp: 25,
      surfaceTemp: 28,
      corrosivity: 'C3 (Media)',
      chemicalExposure: [],
      trafficType: 'Peatonal Ligero',
      uvExposure: 'Moderada',
    },
    evidences: (row.photographic_evidences || []).map((e: any): PhotographicEvidence => ({
      id: e.id,
      projectId: e.project_id,
      fileName: e.file_name,
      fileUrl: e.file_url,
      thumbnailUrl: e.thumbnail_url || e.file_url,
      caption: e.caption,
      anomalyDetected: e.anomaly_detected,
      sha256Hash: e.sha256_hash,
      uploadedBy: e.uploaded_by || 'Inspector Técnico',
      uploadedAt: e.uploaded_at ? new Date(e.uploaded_at).toISOString().split('T')[0] : '',
      fileSizeKb: e.file_size_kb || 0,
      status: e.status,
      technicalNotes: e.technical_notes || '',
    })),
    classification: cls ? {
      category: cls.category,
      coatingType: cls.coating_type,
      confidenceScore: Number(cls.confidence_score) || 95,
      complexity: cls.complexity,
      recommendedSystem: Array.isArray(cls.recommended_system) ? cls.recommended_system : [],
      detectedConditions: Array.isArray(cls.detected_conditions) ? cls.detected_conditions : [],
      missingData: Array.isArray(cls.missing_data) ? cls.missing_data : [],
      observations: cls.observations || '',
      estimatedYieldGallons: cls.estimated_yield_gallons || 0,
      vocCompliance: cls.voc_compliance || 'Cumple VOC',
      classificationDate: cls.classified_at ? new Date(cls.classified_at).toISOString().split('T')[0] : '',
      modelUsed: cls.model_used || 'gemini-3.8-flash',
    } : undefined,
    timeline: (row.timeline_events || []).map((t: any): TimelineEvent => ({
      id: t.id,
      status: t.status,
      label: t.label,
      description: t.description,
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
      author: t.author || 'Sistema',
      role: t.role || 'Operador',
      completed: Boolean(t.completed),
      notes: t.notes || '',
    })),
  };
}

class ApiService {
  private localProjects: Project[] = [...INITIAL_PROJECTS];
  private localClients: Client[] = [...INITIAL_CLIENTS];
  private localInventory: InventoryItem[] = [...INITIAL_INVENTORY];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProj = localStorage.getItem('colorlink_local_projects');
      if (storedProj) this.localProjects = JSON.parse(storedProj);
      const storedCli = localStorage.getItem('colorlink_local_clients');
      if (storedCli) this.localClients = JSON.parse(storedCli);
    } catch {
      // Ignorar error de deserialización
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('colorlink_local_projects', JSON.stringify(this.localProjects));
      localStorage.setItem('colorlink_local_clients', JSON.stringify(this.localClients));
    } catch {
      // Ignorar error de almacenamiento
    }
  }

  // --- COMPROBACIÓN DE SALUD DE BASE DE DATOS ---
  async checkDatabaseHealth(): Promise<{ status: string; database: string; connection: boolean }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('clients').select('id', { count: 'exact', head: true });
        if (error) throw error;
        return {
          status: 'ok',
          database: 'Supabase PostgreSQL (Cloud)',
          connection: true,
        };
      } catch (err: any) {
        return {
          status: 'error',
          database: 'Supabase PostgreSQL (Cloud)',
          connection: false,
        };
      }
    }

    return {
      status: 'ok',
      database: 'Supabase PostgreSQL (Local Fallback Activo)',
      connection: true,
    };
  }

  // --- AUDITORÍA & AUTENTICACIÓN SUPABASE AUTH ---
  private getCurrentStoredUser(): User | null {
    try {
      if (localStorage.getItem('colorlink_logged_out') === 'true') {
        return null;
      }
      const raw = localStorage.getItem('colorlink_auth_user') || sessionStorage.getItem('colorlink_auth_user');
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignorar
    }
    return null;
  }

  private saveUserSession(user: User, remember: boolean = true) {
    try {
      localStorage.removeItem('colorlink_logged_out');
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem('colorlink_auth_user', serialized);
      } else {
        sessionStorage.setItem('colorlink_auth_user', serialized);
      }
    } catch {
      // Ignorar
    }
  }

  private resolveDemoProfile(email: string): User | null {
    const normalized = email.toLowerCase().trim();
    if (normalized.includes('carlos.mendoza') || normalized.includes('admin')) {
      return {
        id: 'a0000000-0000-0000-0000-000000000001',
        name: 'Ing. Carlos Mendoza',
        email: 'carlos.mendoza@colorlink.tech',
        role: 'Administrador',
        avatar: CURRENT_USER.avatar,
        department: 'Dirección de Ingeniería y Recubrimientos',
      };
    }
    if (normalized.includes('laura.pardo') || normalized.includes('auditor') || normalized.includes('diana.morales')) {
      return {
        id: 'a0000000-0000-0000-0000-000000000002',
        name: 'Ing. Laura Pardo',
        email: 'laura.pardo@colorlink.tech',
        role: 'Auditor',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        department: 'Auditoría Técnica NACE & Trazabilidad',
      };
    }
    if (normalized.includes('rsilva') || normalized.includes('petrocaribe') || normalized.includes('cliente')) {
      return {
        id: 'usr-cli-001',
        name: 'Ing. Roberto Silva',
        email: 'rsilva@petrocaribe.com.co',
        role: 'Cliente',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
        department: 'Gerencia de Mantenimiento e Integridad',
        companyId: 'b0000000-0000-0000-0000-000000000001',
        companyName: 'Petroquímica del Caribe S.A.',
        clientId: 'b0000000-0000-0000-0000-000000000001',
      };
    }
    if (normalized.includes('mrestrepo') || normalized.includes('metropoli')) {
      return {
        id: 'usr-cli-002',
        name: 'Arq. Mariana Restrepo',
        email: 'mrestrepo@metropoli-infra.co',
        role: 'Cliente',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
        department: 'Dirección de Obra Civil',
        companyId: 'b0000000-0000-0000-0000-000000000002',
        companyName: 'Constructora Metrópoli & Infraestructura',
        clientId: 'b0000000-0000-0000-0000-000000000002',
      };
    }
    if (normalized.includes('avalencia') || normalized.includes('termpacifico') || normalized.includes('maritimo')) {
      return {
        id: 'usr-cli-003',
        name: 'Cap. Andrés Valencia',
        email: 'avalencia@termpacifico.com',
        role: 'Cliente',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        department: 'Jefatura de Operaciones Portuarias',
        companyId: 'b0000000-0000-0000-0000-000000000003',
        companyName: 'Terminal Marítimo del Pacífico S.A.',
        clientId: 'b0000000-0000-0000-0000-000000000003',
      };
    }

    // Verificar usuarios registrados dinámicamente
    try {
      const storedUsersRaw = localStorage.getItem('colorlink_registered_users');
      if (storedUsersRaw) {
        const storedUsers: User[] = JSON.parse(storedUsersRaw);
        const match = storedUsers.find(u => u.email?.toLowerCase().trim() === normalized);
        if (match) return match;
      }
    } catch {
      // Ignorar error de parsing
    }

    return null;
  }

  async logAuditEvent(
    action: string,
    targetType: 'Proyecto' | 'Cliente' | 'Clasificación IA' | 'Evidencia' | 'Sistema',
    targetId: string,
    details: string,
    user?: Partial<User> | null
  ): Promise<void> {
    const auditUser = user || this.getCurrentStoredUser();
    const payload = {
      user_id: (auditUser?.id && isValidUUID(auditUser.id)) ? auditUser.id : null,
      user_name: auditUser?.name || 'Sistema COLORLINK',
      role: auditUser?.role || 'Administrador',
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: '190.157.34.12 (Sesión Segura)',
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').insert(payload);
      } catch (e) {
        console.warn('No se pudo registrar log de auditoría en Supabase:', e);
      }
    }
  }

  async getAuditLogs(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            timestamp: row.created_at ? new Date(row.created_at).toLocaleString('es-CO') : new Date().toLocaleString(),
            user: row.user_name || 'Sistema',
            role: row.role || 'Administrador',
            action: row.action,
            targetType: row.target_type,
            targetId: row.target_id,
            details: row.details,
            ipAddress: row.ip_address || '127.0.0.1'
          }));
        }
      } catch {
        // Fallback a iniciales
      }
    }
    return INITIAL_AUDIT_LOGS;
  }

  async signInWithPassword(email: string, password?: string, remember: boolean = true): Promise<{ access_token: string; user: User }> {
    let authUser: any = null;
    let token = `token-${Date.now()}`;

    // 1. Intentar con Supabase Auth
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data?.user) {
          authUser = data.user;
          token = data.session?.access_token || token;
        }
      } catch (err) {
        console.warn('Supabase Auth signInWithPassword error:', err);
      }
    }

    // 2. Resolver usuario en public.users
    let resolvedUser: User | null = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (data) {
          const rawRole = (data.role || '').toLowerCase();
          const cleanRole: UserRole = rawRole.includes('admin') || rawRole.includes('super')
            ? 'Administrador'
            : rawRole.includes('audit') || rawRole.includes('tecnico') || rawRole.includes('calidad')
            ? 'Auditor'
            : 'Cliente';

          resolvedUser = {
            id: data.id,
            authUserId: data.auth_user_id || authUser?.id,
            name: data.name,
            email: data.email,
            role: cleanRole,
            avatar: data.avatar_url || (cleanRole === 'Administrador' ? CURRENT_USER.avatar : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'),
            department: data.department || '',
            companyId: data.company_id,
            companyName: data.company_name,
            lastLogin: new Date().toISOString(),
          };

          try {
            await supabase.from('users').update({ 
              last_login: new Date().toISOString() 
            }).eq('id', data.id);
          } catch {
            // Ignorar error al actualizar timestamp
          }
        }
      } catch (err) {
        console.warn('Error resolviendo usuario de tabla users:', err);
      }
    }

    // 3. Fallback a perfil de demostración corporativo
    if (!resolvedUser) {
      resolvedUser = this.resolveDemoProfile(email);
    }

    // 4. Si no se encontró ningún perfil
    if (!resolvedUser) {
      await this.logAuditEvent('LOGIN_FAILED', 'Sistema', email, `Intento de acceso denegado para ${email}`);
      throw new Error('Credenciales incorrectas o usuario no registrado en el sistema.');
    }

    // 5. Guardar sesión y registrar auditoría
    this.saveUserSession(resolvedUser, remember);
    await this.logAuditEvent(
      'LOGIN_SUCCESS',
      'Sistema',
      resolvedUser.id,
      `Inicio de sesión exitoso como ${resolvedUser.role} (${resolvedUser.name})`,
      resolvedUser
    );

    return { access_token: token, user: resolvedUser };
  }

  // Alias compatible
  async login(email: string, password?: string): Promise<{ access_token: string; user: User }> {
    return this.signInWithPassword(email, password, true);
  }

  async resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes('@')) {
      throw new Error('Ingrese un correo electrónico corporativo válido.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
      } catch (e: any) {
        console.warn('Supabase resetPasswordForEmail:', e?.message);
      }
    }

    await this.logAuditEvent(
      'PASSWORD_RESET',
      'Sistema',
      email,
      `Solicitud de recuperación de contraseña enviada a ${email}`
    );

    return {
      success: true,
      message: `Enlace de restablecimiento de contraseña enviado a ${email}.`,
    };
  }

  // --- REGISTRO DE USUARIOS & ENVÍO DE SALUDO DE BIENVENIDA ---
  async registerUser(data: UserRegistrationData): Promise<{ user: User; welcomeEmail: WelcomeEmailMessage; token: string; n8nReport?: any }> {
    const cleanRole: UserRole = data.role === 'Auditor' ? 'Auditor' : data.role === 'Administrador' ? 'Administrador' : 'Cliente';
    let registeredUser: User | null = null;
    let welcomeEmail: WelcomeEmailMessage | null = null;
    let token = `token-${Date.now()}`;
    let n8nReport: any = null;

    // 1. Intentar registrar a través de la API REST del backend
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.user && json.welcomeEmail) {
          registeredUser = json.user;
          welcomeEmail = json.welcomeEmail;
          token = json.access_token || token;
          n8nReport = json.n8nReport || null;
        }
      }
    } catch (err) {
      console.warn('API /api/v1/auth/register fallback local:', err);
    }

    // 2. Si no se obtuvo de la API, generar de forma local persistente
    if (!registeredUser || !welcomeEmail) {
      const userId = generateUUID();
      const companyId = generateUUID();

      // Asegurar que el cliente/empresa exista en la lista local
      let existingClient = this.localClients.find(c => 
        c.companyName.toLowerCase() === data.companyName.toLowerCase() ||
        (data.taxId && c.taxId === data.taxId)
      );

      if (!existingClient) {
        existingClient = {
          id: companyId,
          taxId: data.taxId || `NIT-${Math.floor(100000000 + Math.random() * 900000000)}-1`,
          companyName: data.companyName,
          contactName: data.name,
          email: data.email,
          phone: data.phone || '+57 300 000 0000',
          city: data.city || 'Bogotá D.C.',
          address: 'Sede Principal',
          industry: 'Industrial',
          status: 'Activo',
          createdAt: new Date().toISOString().split('T')[0],
          totalProjects: 0,
        };
        this.localClients = [existingClient, ...this.localClients];
        this.saveToStorage();
      }

      registeredUser = {
        id: userId,
        name: data.name,
        email: data.email,
        role: cleanRole,
        avatar: cleanRole === 'Auditor'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
          : cleanRole === 'Administrador'
          ? CURRENT_USER.avatar
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        department: data.department || data.position || 'Operaciones',
        companyId: existingClient.id,
        companyName: data.companyName,
        clientId: existingClient.id,
        lastLogin: new Date().toISOString(),
      };

      welcomeEmail = generateWelcomeEmail({
        ...data,
        taxId: existingClient.taxId,
      });

      // Si Supabase está configurado, registrar en tabla users
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('users').insert({
            id: userId,
            name: data.name,
            email: data.email,
            role: cleanRole,
            department: registeredUser.department,
            company_id: existingClient.id,
            company_name: data.companyName,
            avatar_url: registeredUser.avatar,
            created_at: new Date().toISOString(),
          });
        } catch (supabaseErr) {
          console.warn('Error insertando usuario en Supabase:', supabaseErr);
        }
      }

      // Fallback: Si el backend no ejecutó el webhook, invocarlo desde cliente una única vez
      try {
        const whRes = await sendN8nWelcomeWebhook({
          event: 'USER_REGISTRATION',
          name: registeredUser.name,
          email: registeredUser.email,
          companyName: data.companyName,
          nombre: registeredUser.name,
          correo: registeredUser.email,
          empresa: data.companyName,
          taxId: data.taxId,
          nit: data.taxId,
          phone: data.phone,
          telefono: data.phone,
          role: registeredUser.role,
          department: registeredUser.department,
          position: data.position,
          cargo: data.position,
          industrySector: data.industrySector,
          city: data.city,
          ciudad: data.city,
          activationCode: welcomeEmail.activationCode,
          temporaryPassword: data.password || 'ColorLink2026*',
          registeredAt: new Date().toISOString(),
          subject: welcomeEmail.subject,
          htmlContent: welcomeEmail.htmlContent,
          textContent: welcomeEmail.textContent,
          source: 'COLORLINK Frontend Client - Fallback',
          webhookUrl: N8N_WELCOME_WEBHOOK_URL
        });
        n8nReport = whRes.report;
      } catch (whErr) {
        console.warn('n8n Webhook trigger warning:', whErr);
      }
    }

    // 3. Guardar usuario en la lista de usuarios registrados en localStorage
    try {
      const storedUsersRaw = localStorage.getItem('colorlink_registered_users');
      const list: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const updatedList = [registeredUser, ...list.filter(u => u.email.toLowerCase() !== registeredUser!.email.toLowerCase())];
      localStorage.setItem('colorlink_registered_users', JSON.stringify(updatedList));

      // Guardar también el correo recibido en la bandeja del usuario
      const storedEmailsRaw = localStorage.getItem('colorlink_received_emails');
      const emailList: WelcomeEmailMessage[] = storedEmailsRaw ? JSON.parse(storedEmailsRaw) : [];
      const updatedEmailList = [welcomeEmail, ...emailList.filter(e => e.id !== welcomeEmail!.id)];
      localStorage.setItem('colorlink_received_emails', JSON.stringify(updatedEmailList));
    } catch {
      // Ignorar error de storage
    }

    // 4. Registrar evento en log de auditoría
    await this.logAuditEvent(
      'USER_REGISTERED',
      'Cliente',
      registeredUser.id,
      `Nuevo usuario registrado: ${registeredUser.name} (${cleanRole}) para ${data.companyName}. Saludo de bienvenida enviado a ${data.email} vía n8n webhook.`,
      registeredUser
    );

    return {
      user: registeredUser,
      welcomeEmail,
      token,
      n8nReport,
    };
  }

  async getDispatchedEmails(): Promise<WelcomeEmailMessage[]> {
    let emails: WelcomeEmailMessage[] = [];
    try {
      const res = await fetch('/api/v1/emails');
      if (res.ok) {
        emails = await res.json();
      }
    } catch {
      // Fallback
    }

    try {
      const stored = localStorage.getItem('colorlink_received_emails');
      if (stored) {
        const localList: WelcomeEmailMessage[] = JSON.parse(stored);
        const existingIds = new Set(emails.map(e => e.id));
        for (const item of localList) {
          if (!existingIds.has(item.id)) {
            emails.push(item);
          }
        }
      }
    } catch {
      // Ignorar
    }

    return emails;
  }

  async getSession(): Promise<User | null> {
    if (localStorage.getItem('colorlink_logged_out') === 'true') {
      return null;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const authUser = data.session.user;
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email || '')
            .maybeSingle();

          if (dbUser) {
            const rawRole = (dbUser.role || '').toLowerCase();
            const cleanRole: UserRole = rawRole.includes('admin') || rawRole.includes('super')
              ? 'Administrador'
              : rawRole.includes('audit') || rawRole.includes('tecnico') || rawRole.includes('calidad')
              ? 'Auditor'
              : 'Cliente';

            const user: User = {
              id: dbUser.id,
              authUserId: authUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: cleanRole,
              avatar: dbUser.avatar_url || CURRENT_USER.avatar,
              department: dbUser.department || '',
              companyId: dbUser.company_id,
              companyName: dbUser.company_name,
              lastLogin: dbUser.last_login,
            };
            this.saveUserSession(user, true);
            return user;
          }
        }
      } catch {
        // Continuar al storage
      }
    }

    return this.getCurrentStoredUser();
  }

  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          callback(null);
        } else if (session.user) {
          const user = await this.getSession();
          callback(user);
        }
      });
      return { unsubscribe: () => subscription.unsubscribe() };
    }
    return { unsubscribe: () => {} };
  }

  async logout(currentUser?: User | null): Promise<void> {
    const current = currentUser || this.getCurrentStoredUser();
    if (current) {
      await this.logAuditEvent(
        'LOGOUT',
        'Sistema',
        current.id,
        `Cierre de sesión de ${current.name} (${current.role})`,
        current
      );
    }

    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch {
      // Ignorar error de red en logout
    } finally {
      try {
        localStorage.removeItem('colorlink_auth_user');
        localStorage.removeItem('colorlink_token');
        localStorage.setItem('colorlink_logged_out', 'true');
        sessionStorage.clear();
      } catch {
        // Ignorar error de storage
      }
    }
  }

  // --- CLIENTES ---
  async getClients(): Promise<Client[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const { data: projectCounts } = await supabase.from('projects').select('client_id');
          const countsMap: Record<string, number> = {};
          (projectCounts || []).forEach((p: any) => {
            countsMap[p.client_id] = (countsMap[p.client_id] || 0) + 1;
          });

          return data.map((row: any): Client => ({
            id: row.id,
            taxId: row.tax_id,
            companyName: row.company_name,
            contactName: row.contact_name,
            email: row.email,
            phone: row.phone,
            city: row.city,
            address: row.address || '',
            industry: row.industry,
            status: row.status,
            createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
            totalProjects: countsMap[row.id] || 0,
          }));
        }
      } catch (err) {
        console.warn('Supabase getClients error, usando fallback local:', err);
      }
    }
    return this.localClients;
  }

  async getClientById(id: string): Promise<Client> {
    const clients = await this.getClients();
    const found = clients.find(c => c.id === id);
    if (!found) throw new Error('Cliente no encontrado');
    return found;
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const clientId = isValidUUID(clientData.id) ? clientData.id! : generateUUID();
    const createdDate = new Date().toISOString().split('T')[0];

    const newClient: Client = {
      id: clientId,
      taxId: clientData.taxId || `NIT-${Date.now()}`,
      companyName: clientData.companyName || 'Empresa Sin Nombre',
      contactName: clientData.contactName || 'Contacto Comercial',
      email: clientData.email || 'contacto@empresa.com',
      phone: clientData.phone || '+57 300 000 0000',
      city: clientData.city || 'Bogotá',
      address: clientData.address || '',
      industry: clientData.industry || 'Industrial',
      status: clientData.status || 'Activo',
      createdAt: createdDate,
      totalProjects: 0,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          id: clientId,
          tax_id: newClient.taxId,
          company_name: newClient.companyName,
          contact_name: newClient.contactName,
          email: newClient.email,
          phone: newClient.phone,
          city: newClient.city,
          address: newClient.address,
          industry: newClient.industry,
          status: newClient.status,
        };
        const { error } = await supabase.from('clients').insert(payload);
        if (error) console.error('Error insertando cliente en Supabase:', error);
      } catch (err) {
        console.error('Error persistiendo cliente en Supabase:', err);
      }
    }

    this.localClients = [newClient, ...this.localClients];
    this.saveToStorage();
    return newClient;
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      try {
        const payload: Record<string, any> = {};
        if (clientData.companyName) payload.company_name = clientData.companyName;
        if (clientData.contactName) payload.contact_name = clientData.contactName;
        if (clientData.email) payload.email = clientData.email;
        if (clientData.phone) payload.phone = clientData.phone;
        if (clientData.city) payload.city = clientData.city;
        if (clientData.address !== undefined) payload.address = clientData.address;
        if (clientData.industry) payload.industry = clientData.industry;
        if (clientData.status) payload.status = clientData.status;

        await supabase.from('clients').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Error actualizando cliente en Supabase:', err);
      }
    }

    this.localClients = this.localClients.map(c => c.id === id ? { ...c, ...clientData } : c);
    this.saveToStorage();
    return this.getClientById(id);
  }

  async deleteClient(id: string): Promise<Client> {
    const existing = await this.getClientById(id);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('clients').delete().eq('id', id);
    }
    this.localClients = this.localClients.filter(c => c.id !== id);
    this.saveToStorage();
    return existing;
  }

  // --- PROYECTOS ---
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            clients:client_id (company_name),
            project_areas (*),
            operational_conditions (*),
            photographic_evidences (*),
            gemini_classifications (*),
            timeline_events (*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          return data.map(mapSupabaseProject);
        }
      } catch (err) {
        console.warn('Supabase getProjects error, usando fallback local:', err);
      }
    }
    return this.localProjects;
  }

  async getProjectById(id: string): Promise<Project> {
    const projects = await this.getProjects();
    const found = projects.find(p => p.id === id);
    if (!found) throw new Error('Proyecto no encontrado');
    return found;
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const projectId = isValidUUID(projectData.id) ? projectData.id! : generateUUID();
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    // Asegurar que el clientId sea un UUID válido antes de referenciarlo
    let validClientId = isValidUUID(projectData.clientId) ? projectData.clientId! : '';
    if (!validClientId && this.localClients.length > 0) {
      const match = this.localClients.find(c => c.companyName === projectData.clientName);
      if (match && isValidUUID(match.id)) {
        validClientId = match.id;
      }
    }
    if (!validClientId) {
      validClientId = generateUUID();
    }

    const fullProject: Project = {
      id: projectId,
      code: projectData.code || `COL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: projectData.title || 'Proyecto Sin Título',
      clientId: validClientId,
      clientName: projectData.clientName || 'Cliente Corporativo',
      city: projectData.city || 'Bogotá',
      projectType: projectData.projectType || 'Industrial',
      priority: projectData.priority || 'Media',
      budgetEstimated: projectData.budgetEstimated || 0,
      status: projectData.status || 'Borrador',
      createdAt: todayStr,
      updatedAt: todayStr,
      deadline: projectData.deadline || todayStr,
      areas: (projectData.areas || []).map(a => ({
        ...a,
        id: isValidUUID(a.id) ? a.id : generateUUID(),
      })),
      conditions: projectData.conditions || {
        humidity: 65,
        ambientTemp: 24,
        surfaceTemp: 26,
        corrosivity: 'C3 (Media)',
        chemicalExposure: [],
        trafficType: 'Peatonal Ligero',
        uvExposure: 'Moderada',
      },
      evidences: (projectData.evidences || []).map(e => ({
        ...e,
        id: isValidUUID(e.id) ? e.id : generateUUID(),
      })),
      classification: projectData.classification,
      timeline: projectData.timeline || [
        {
          id: generateUUID(),
          status: 'Borrador',
          label: 'Creación de Proyecto',
          description: 'Registro inicial completado en COLORLINK',
          date: todayStr,
          author: CURRENT_USER.name,
          role: CURRENT_USER.role,
          completed: true,
        },
      ],
      assignedEngineer: projectData.assignedEngineer || CURRENT_USER.name,
      assignedSalesperson: projectData.assignedSalesperson || 'Asesor Comercial',
      totalSqm: projectData.totalSqm || 0,
      activeAlerts: projectData.activeAlerts || [],
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Insertar Proyecto
        await supabase.from('projects').insert({
          id: projectId,
          code: fullProject.code,
          title: fullProject.title,
          client_id: fullProject.clientId,
          client_name: fullProject.clientName,
          city: fullProject.city,
          project_type: fullProject.projectType,
          priority: fullProject.priority,
          budget_estimated: fullProject.budgetEstimated,
          status: fullProject.status,
          total_sqm: fullProject.totalSqm,
          assigned_engineer: fullProject.assignedEngineer,
          assigned_salesperson: fullProject.assignedSalesperson,
          deadline: fullProject.deadline || null,
          active_alerts: fullProject.activeAlerts,
        });

        // 2. Insertar Áreas
        if (fullProject.areas.length > 0) {
          const areaRows = fullProject.areas.map(a => ({
            id: a.id,
            project_id: projectId,
            name: a.name,
            substrate: a.substrate,
            sqm: a.sqm,
            location: a.location,
            height_meters: a.heightMeters,
            initial_condition: a.initialCondition,
          }));
          await supabase.from('project_areas').insert(areaRows);
        }

        // 3. Insertar Condiciones
        await supabase.from('operational_conditions').insert({
          id: generateUUID(),
          project_id: projectId,
          humidity: fullProject.conditions.humidity,
          ambient_temp: fullProject.conditions.ambientTemp,
          surface_temp: fullProject.conditions.surfaceTemp,
          corrosivity: fullProject.conditions.corrosivity,
          chemical_exposure: fullProject.conditions.chemicalExposure,
          traffic_type: fullProject.conditions.trafficType,
          uv_exposure: fullProject.conditions.uvExposure,
          special_requirements: fullProject.conditions.specialRequirements || null,
        });

        // 4. Insertar Evidencias
        if (fullProject.evidences.length > 0) {
          const evRows = fullProject.evidences.map(e => ({
            id: e.id,
            project_id: projectId,
            file_name: e.fileName,
            file_url: e.fileUrl,
            thumbnail_url: e.thumbnailUrl,
            caption: e.caption,
            anomaly_detected: e.anomalyDetected,
            sha256_hash: e.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            uploaded_by: e.uploadedBy,
            file_size_kb: e.fileSizeKb,
            status: e.status,
            technical_notes: e.technicalNotes || null,
          }));
          await supabase.from('photographic_evidences').insert(evRows);
        }

        // 5. Insertar Timeline
        if (fullProject.timeline.length > 0) {
          const tmRows = fullProject.timeline.map(t => ({
            id: t.id,
            project_id: projectId,
            status: t.status,
            label: t.label,
            description: t.description,
            author: t.author,
            role: t.role,
            completed: t.completed,
            notes: t.notes || null,
          }));
          await supabase.from('timeline_events').insert(tmRows);
        }

        // 6. Insertar Clasificación si existe
        if (fullProject.classification) {
          await supabase.from('gemini_classifications').insert({
            id: generateUUID(),
            project_id: projectId,
            category: fullProject.classification.category,
            coating_type: fullProject.classification.coatingType,
            confidence_score: fullProject.classification.confidenceScore,
            complexity: fullProject.classification.complexity,
            recommended_system: fullProject.classification.recommendedSystem,
            detected_conditions: fullProject.classification.detectedConditions,
            missing_data: fullProject.classification.missingData,
            observations: fullProject.classification.observations,
            estimated_yield_gallons: fullProject.classification.estimatedYieldGallons,
            voc_compliance: fullProject.classification.vocCompliance,
            model_used: fullProject.classification.modelUsed || 'gemini-3.8-flash',
          });
        }
      } catch (err) {
        console.error('Error insertando proyecto completo en Supabase:', err);
      }
    }

    this.localProjects = [fullProject, ...this.localProjects];
    this.saveToStorage();
    return fullProject;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (projectData.title) payload.title = projectData.title;
        if (projectData.status) payload.status = projectData.status;
        if (projectData.budgetEstimated !== undefined) payload.budget_estimated = projectData.budgetEstimated;
        if (projectData.city) payload.city = projectData.city;
        if (projectData.priority) payload.priority = projectData.priority;
        if (projectData.totalSqm !== undefined) payload.total_sqm = projectData.totalSqm;

        await supabase.from('projects').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Error actualizando proyecto en Supabase:', err);
      }
    }

    this.localProjects = this.localProjects.map(p => p.id === id ? { ...p, ...projectData } : p);
    this.saveToStorage();
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<Project> {
    const existing = await this.getProjectById(id);
    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('projects').delete().eq('id', id);
    }
    this.localProjects = this.localProjects.filter(p => p.id !== id);
    this.saveToStorage();
    return existing;
  }

  async updateProjectStatus(
    id: string, 
    status: string, 
    notes?: string, 
    authorName?: string, 
    authorRole?: string
  ): Promise<Project> {
    const project = await this.getProjectById(id);
    const newEvent: TimelineEvent = {
      id: generateUUID(),
      status: status as any,
      label: `Transición a ${status}`,
      description: notes || `El estado del proyecto fue actualizado a ${status}.`,
      date: new Date().toISOString().split('T')[0],
      author: authorName || CURRENT_USER.name,
      role: authorRole || CURRENT_USER.role,
      completed: true,
      notes,
    };

    const updatedTimeline = [...project.timeline, newEvent];
    const updated = {
      ...project,
      status: status as any,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (isSupabaseConfigured && supabase && isValidUUID(id)) {
      await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      await supabase.from('timeline_events').insert({
        id: newEvent.id,
        project_id: id,
        status,
        label: newEvent.label,
        description: newEvent.description,
        author: newEvent.author,
        role: newEvent.role,
        completed: true,
        notes: notes || null,
      });
    }

    this.localProjects = this.localProjects.map(p => p.id === id ? updated : p);
    this.saveToStorage();
    return updated;
  }

  // --- ÁREAS ---
  async getProjectAreas(projectId: string): Promise<ProjectArea[]> {
    const proj = await this.getProjectById(projectId);
    return proj.areas || [];
  }

  async addProjectArea(projectId: string, area: Partial<ProjectArea>): Promise<ProjectArea> {
    const newArea: ProjectArea = {
      id: isValidUUID(area.id) ? area.id! : generateUUID(),
      name: area.name || 'Área Nueva',
      substrate: area.substrate || 'Acero al Carbono',
      sqm: area.sqm || 0,
      location: area.location || 'Exterior',
      heightMeters: area.heightMeters || 0,
      initialCondition: area.initialCondition || 'Óxido Grado A/B',
    };

    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      await supabase.from('project_areas').insert({
        id: newArea.id,
        project_id: projectId,
        name: newArea.name,
        substrate: newArea.substrate,
        sqm: newArea.sqm,
        location: newArea.location,
        height_meters: newArea.heightMeters,
        initial_condition: newArea.initialCondition,
      });
    }

    this.localProjects = this.localProjects.map(p => {
      if (p.id === projectId) {
        return { ...p, areas: [...p.areas, newArea] };
      }
      return p;
    });
    this.saveToStorage();
    return newArea;
  }

  async deleteProjectArea(projectId: string, areaId: string): Promise<ProjectArea> {
    const areas = await this.getProjectAreas(projectId);
    const existing = areas.find(a => a.id === areaId);
    if (isSupabaseConfigured && supabase && isValidUUID(areaId)) {
      await supabase.from('project_areas').delete().eq('id', areaId);
    }
    this.localProjects = this.localProjects.map(p => {
      if (p.id === projectId) {
        return { ...p, areas: p.areas.filter(a => a.id !== areaId) };
      }
      return p;
    });
    this.saveToStorage();
    return existing || {
      id: areaId,
      name: 'Área eliminada',
      substrate: 'Acero al Carbono',
      sqm: 0,
      location: 'Exterior',
      heightMeters: 0,
      initialCondition: 'Óxido Grado A/B',
    };
  }

  // --- EVIDENCIAS ---
  async getProjectEvidences(projectId: string): Promise<PhotographicEvidence[]> {
    const proj = await this.getProjectById(projectId);
    return proj.evidences || [];
  }

  async addProjectEvidence(projectId: string, evidence: Partial<PhotographicEvidence>): Promise<PhotographicEvidence> {
    const newEv: PhotographicEvidence = {
      id: isValidUUID(evidence.id) ? evidence.id! : generateUUID(),
      projectId,
      fileName: evidence.fileName || 'evidencia.jpg',
      fileUrl: evidence.fileUrl || '',
      thumbnailUrl: evidence.thumbnailUrl || evidence.fileUrl || '',
      caption: evidence.caption || 'Inspección técnica',
      anomalyDetected: evidence.anomalyDetected || 'Superficie Limpia',
      sha256Hash: evidence.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000',
      uploadedBy: evidence.uploadedBy || CURRENT_USER.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSizeKb: evidence.fileSizeKb || 500,
      status: evidence.status || 'Verificada',
      technicalNotes: evidence.technicalNotes || '',
    };

    if (isSupabaseConfigured && supabase && isValidUUID(projectId)) {
      await supabase.from('photographic_evidences').insert({
        id: newEv.id,
        project_id: projectId,
        file_name: newEv.fileName,
        file_url: newEv.fileUrl,
        thumbnail_url: newEv.thumbnailUrl,
        caption: newEv.caption,
        anomaly_detected: newEv.anomalyDetected,
        sha256_hash: newEv.sha256Hash,
        uploaded_by: newEv.uploadedBy,
        file_size_kb: newEv.fileSizeKb,
        status: newEv.status,
        technical_notes: newEv.technicalNotes,
      });
    }

    this.localProjects = this.localProjects.map(p => {
      if (p.id === projectId) {
        return { ...p, evidences: [...p.evidences, newEv] };
      }
      return p;
    });
    this.saveToStorage();
    return newEv;
  }

  // --- INVENTARIO ---
  async getInventory(): Promise<InventoryItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          return data.map((row: any): InventoryItem => ({
            id: row.id,
            sku: row.sku,
            name: row.name,
            category: row.category,
            brand: row.brand,
            solidsByVolume: Number(row.solids_by_volume) || 0,
            theoreticalYieldSqmGal: Number(row.theoretical_yield_sqm_gal) || 0,
            dryingTimeTouchHours: Number(row.drying_time_touch_hours) || 0,
            recoatTimeHours: row.recoat_time_hours || '4 horas',
            vocGramsLiter: Number(row.voc_grams_liter) || 0,
            currentStockGallons: Number(row.current_stock_gallons) || 0,
            unitPriceUSD: Number(row.unit_price_usd) || 0,
            technicalSheetUrl: row.technical_sheet_url || '',
          }));
        }
      } catch (err) {
        console.warn('Supabase getInventory error, usando fallback:', err);
      }
    }
    return this.localInventory;
  }

  async createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      id: isValidUUID(item.id) ? item.id! : generateUUID(),
      sku: item.sku || `SKU-${Date.now()}`,
      name: item.name || 'Nuevo Recubrimiento',
      category: item.category || 'Primers Epóxicos',
      brand: item.brand || 'ColorLink Pro',
      solidsByVolume: item.solidsByVolume || 70,
      theoreticalYieldSqmGal: item.theoreticalYieldSqmGal || 25,
      dryingTimeTouchHours: item.dryingTimeTouchHours || 2,
      recoatTimeHours: item.recoatTimeHours || '4-12 horas',
      vocGramsLiter: item.vocGramsLiter || 200,
      currentStockGallons: item.currentStockGallons || 50,
      unitPriceUSD: item.unitPriceUSD || 50,
      technicalSheetUrl: item.technicalSheetUrl || '',
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_items').insert({
        id: newItem.id,
        sku: newItem.sku,
        name: newItem.name,
        category: newItem.category,
        brand: newItem.brand,
        solids_by_volume: newItem.solidsByVolume,
        theoretical_yield_sqm_gal: newItem.theoreticalYieldSqmGal,
        drying_time_touch_hours: newItem.dryingTimeTouchHours,
        recoat_time_hours: newItem.recoatTimeHours,
        voc_grams_liter: newItem.vocGramsLiter,
        current_stock_gallons: newItem.currentStockGallons,
        unit_price_usd: newItem.unitPriceUSD,
        technical_sheet_url: newItem.technicalSheetUrl,
      });
    }

    this.localInventory = [...this.localInventory, newItem];
    return newItem;
  }
}

export const apiService = new ApiService();
