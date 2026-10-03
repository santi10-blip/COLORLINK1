import { UserRegistrationData, WelcomeEmailMessage } from '../types';

/**
 * Generador de Plantilla de Correo Electrónico de Bienvenida Corporativo para COLORLINK.
 * Genera código HTML responsive estándar y texto plano compatible con todos los clientes de correo (Outlook, Gmail, Apple Mail, Webmail).
 */

export function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `COL-${code}`;
}

export function generateWelcomeEmail(data: UserRegistrationData, activationCode?: string): WelcomeEmailMessage {
  const code = activationCode || generateActivationCode();
  const dateFormatted = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const roleBadgeTitle = data.role === 'Cliente'
    ? 'Cliente Corporativo (Empresa Propietaria / Contratista)'
    : data.role === 'Auditor'
    ? 'Auditor Técnico (Interventoría y Certificación NACE)'
    : 'Administrador de Plataforma';

  const roleColor = data.role === 'Cliente' ? '#2563EB' : data.role === 'Auditor' ? '#059669' : '#7C3AED';

  const subject = `🎨 ¡Bienvenido a COLORLINK! - Confirmación de Registro y Credenciales de Acceso`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 620px;
      margin: 24px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
      border: 1px solid #E2E8F0;
    }
    .header-banner {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%);
      padding: 36px 32px;
      text-align: left;
      color: #FFFFFF;
      position: relative;
    }
    .brand-logo-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #38BDF8;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 8px 0;
      line-height: 1.25;
      color: #FFFFFF;
    }
    .header-subtitle {
      font-size: 14px;
      color: #94A3B8;
      margin: 0;
      line-height: 1.5;
    }
    .content-body {
      padding: 32px;
    }
    .greeting-block {
      margin-bottom: 24px;
    }
    .greeting-title {
      font-size: 19px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 10px 0;
    }
    .greeting-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 14px 0;
    }
    .info-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .info-card-header {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748B;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #EDF2F7;
      font-size: 13px;
    }
    .data-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .data-label {
      color: #64748B;
      font-weight: 500;
    }
    .data-value {
      color: #0F172A;
      font-weight: 600;
      text-align: right;
    }
    .role-tag {
      background-color: ${roleColor}15;
      color: ${roleColor};
      border: 1px solid ${roleColor}30;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .code-box {
      background: #0F172A;
      color: #38BDF8;
      font-family: 'Courier New', Courier, monospace;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: bold;
      letter-spacing: 2px;
      display: inline-block;
      margin-top: 4px;
    }
    .features-list {
      margin: 24px 0;
      padding: 0;
      list-style: none;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 13px;
      color: #334155;
      line-height: 1.4;
    }
    .feature-icon {
      margin-right: 12px;
      font-size: 16px;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .cta-button {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: #FFFFFF !important;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .notice-box {
      background-color: #EFF6FF;
      border-left: 4px solid #3B82F6;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #1E40AF;
      margin: 20px 0;
      line-height: 1.5;
    }
    .footer {
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px 32px;
      text-align: center;
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Encabezado Corporativo COLORLINK -->
    <div class="header-banner">
      <div class="brand-logo-badge">
        🎨 COLORLINK ENTERPRISE
      </div>
      <h1 class="header-title">¡Te damos la bienvenida a COLORLINK!</h1>
      <p class="header-subtitle">Plataforma Empresarial para Gestión de Recubrimientos y Control de Corrosión con IA.</p>
    </div>

    <!-- Cuerpo del Correo -->
    <div class="content-body">
      <div class="greeting-block">
        <h2 class="greeting-title">Estimado/a ${data.name},</h2>
        <p class="greeting-text">
          Nos alegra darte la bienvenida a la plataforma <strong>COLORLINK</strong>. Tu registro ha sido procesado exitosamente y tu espacio de trabajo para <strong>${data.companyName}</strong> se encuentra habilitado para operar bajo los estándares técnicos internacionales ISO 12944 y SSPC.
        </p>
      </div>

      <!-- Resumen de Credenciales y Cuenta Registrada -->
      <div class="info-card">
        <div class="info-card-header">
          📋 Datos de tu Cuenta y Perfil Corporativo
        </div>
        <div class="data-row">
          <span class="data-label">Usuario / Correo:</span>
          <span class="data-value">${data.email}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Empresa / Organización:</span>
          <span class="data-value">${data.companyName}${data.taxId ? ` (NIT: ${data.taxId})` : ''}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Rol Asignado:</span>
          <span class="data-value">
            <span class="role-tag">${roleBadgeTitle}</span>
          </span>
        </div>
        ${data.position ? `
        <div class="data-row">
          <span class="data-label">Cargo / Área:</span>
          <span class="data-value">${data.position}</span>
        </div>
        ` : ''}
        ${data.phone ? `
        <div class="data-row">
          <span class="data-label">Teléfono Registrado:</span>
          <span class="data-value">${data.phone}</span>
        </div>
        ` : ''}
        <div class="data-row">
          <span class="data-label">Fecha de Registro:</span>
          <span class="data-value">${dateFormatted}</span>
        </div>
        <div class="data-row" style="align-items: center;">
          <span class="data-label">Código de Verificación:</span>
          <span class="data-value">
            <span class="code-box">${code}</span>
          </span>
        </div>
      </div>

      <!-- Notificación Importante -->
      <div class="notice-box">
        🔒 <strong>Seguridad y Acceso:</strong> Puedes acceder directamente a la plataforma usando tu correo corporativo <strong>${data.email}</strong> y la contraseña elegida en el momento de tu registro.
      </div>

      <!-- Funcionalidades Clave Disponibles -->
      <div style="margin-top: 24px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">
          🚀 Lo que puedes hacer a partir de ahora en COLORLINK:
        </h3>
        <ul class="features-list">
          <li class="feature-item">
            <span class="feature-icon">📁</span>
            <div><strong>Control de Proyectos:</strong> Registra y gestiona obras de recubrimientos industriales mediante el Wizard interactivo de 9 pasos.</div>
          </li>
          <li class="feature-item">
            <span class="feature-icon">📷</span>
            <div><strong>Evidencias Fotográficas:</strong> Certifica cada etapa de inspección con sellado criptográfico inmutable SHA-256.</div>
          </li>
          <li class="feature-item">
            <span class="feature-icon">🤖</span>
            <div><strong>Clasificación con IA Gemini 3.8:</strong> Diagnósticos automatizados y especificación de sistemas multicapa según corrosividad ambiental (C1 a C5).</div>
          </li>
          <li class="feature-item">
            <span class="feature-icon">📊</span>
            <div><strong>Reportes Ejecutivos:</strong> Genera informes ejecutivos, cálculo de galonaje teórico y hojas de vida de proyectos para interventorías.</div>
          </li>
        </ul>
      </div>

      <!-- Botón de Llamado a la Acción -->
      <div class="cta-container">
        <a href="${typeof window !== 'undefined' ? window.location.origin : '#'}" class="cta-button">
          Acceder a COLORLINK &raquo;
        </a>
      </div>
    </div>

    <!-- Pie de Página Institucional -->
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748B;">
        COLORLINK Enterprise Systems &bull; Tecnología Aplicada a Recubrimientos Industriales
      </p>
      <p style="margin: 0 0 6px 0;">
        Bogotá D.C., Colombia &bull; Soporte Técnico: <a href="mailto:soporte@colorlink.tech" style="color: #2563EB; text-decoration: none;">soporte@colorlink.tech</a>
      </p>
      <p style="margin: 0; font-size: 10px; color: #94A3B8;">
        Este mensaje fue enviado de manera automática tras procesar tu registro en la plataforma COLORLINK. Si no solicitaste este acceso, por favor contacta a nuestro equipo de seguridad técnica.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
=====================================================
COLORLINK ENTERPRISE - SALUDO OFICIAL DE BIENVENIDA
=====================================================

Estimado/a ${data.name},

¡Te damos una cordial bienvenida a COLORLINK!

Tu registro corporativo ha sido completado satisfactoriamente. A continuación te presentamos el resumen de tu cuenta:

* Nombre Completo: ${data.name}
* Correo Corporativo: ${data.email}
* Empresa / Organización: ${data.companyName} ${data.taxId ? `(NIT: ${data.taxId})` : ''}
* Rol Asignado: ${roleBadgeTitle}
* Cargo: ${data.position || 'No especificado'}
* Teléfono: ${data.phone || 'No especificado'}
* Código de Activación: ${code}
* Fecha de Registro: ${dateFormatted}

Puedes acceder a la plataforma utilizando tu correo corporativo (${data.email}) y la contraseña definida durante el registro.

CAPACIDADES HABILITADAS:
1. Control Integral de Proyectos con Wizard guiado de 9 pasos.
2. Certificación de evidencias fotográficas con integridad criptográfica SHA-256.
3. Recomendación de sistemas multicapa con IA Gemini 3.8 Flash (ISO 12944 / SSPC).
4. Emisión de reportes técnicos ejecutivos y auditoría NACE.

Para ingresar a la plataforma, visita el portal de COLORLINK.

Atentamente,
Equipo de Ingeniería y Soporte Técnico COLORLINK
soporte@colorlink.tech
Bogotá D.C., Colombia
=====================================================
  `.trim();

  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: data.email,
    recipientName: data.name,
    subject,
    htmlContent,
    textContent,
    sentAt: new Date().toISOString(),
    status: 'Entregado',
    companyName: data.companyName,
    role: data.role,
    activationCode: code,
    temporaryPassword: data.password,
  };
}

export const emailService = {
  generateWelcomeEmail,
  generateActivationCode,
};
