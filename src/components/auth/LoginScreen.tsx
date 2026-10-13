import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Building2, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  FileText, 
  Camera, 
  FolderKanban, 
  ClipboardCheck, 
  HelpCircle,
  X,
  Send
} from 'lucide-react';
import { User, Client, WelcomeEmailMessage } from '../../types';
import { apiService } from '../../services/apiService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { UserRegistrationModal } from './UserRegistrationModal';
import { WelcomeEmailViewerModal } from './WelcomeEmailViewerModal';
import { Inbox } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  availableClients?: Client[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess,
  availableClients = []
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');

  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState<{ user: User; email: WelcomeEmailMessage } | null>(null);
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false);
  // Ejecución de inicio de sesión con Supabase Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor ingrese su correo electrónico corporativo.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { user } = await apiService.signInWithPassword(email.trim(), password, rememberMe);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al autenticar credenciales en Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flujo de recuperación de contraseña con supabase.auth.resetPasswordForEmail
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetStatus('error');
      setResetMessage('Ingrese una dirección de correo válida.');
      return;
    }

    try {
      setResetStatus('loading');
      const res = await apiService.resetPasswordForEmail(resetEmail);
      setResetStatus('success');
      setResetMessage(res.message);
    } catch (err: any) {
      setResetStatus('error');
      setResetMessage(err?.message || 'Error al solicitar el restablecimiento.');
    }
  };

  // Callback tras completar la plantilla de registro y envío de correo
  const handleRegistrationCompleted = (newUser: User, emailMsg: WelcomeEmailMessage) => {
    setRegistrationNotice({ user: newUser, email: emailMsg });
    setEmail(newUser.email);
    setPassword('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* Container Principal Dividido (Split Layout Corporativo) */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800/20">
        
        {/* ========================================================================= */}
        {/* LADO IZQUIERDO: IMAGEN CORPORATIVA & PRESENTACIÓN EMPRESARIAL */}
        {/* Inspiración: Microsoft Azure / SAP Fiori / Oracle Cloud */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Fondo sutil de gradiente y figuras geométricas */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Corporativo Izquierdo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">
                  COLORLINK
                </span>
                <span className="text-[11px] font-bold text-blue-300 tracking-wider uppercase">
                  Enterprise Platform v2.4
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
              Plataforma Inteligente para Gestión de Recubrimientos, Inspección Técnica y Auditoría.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-8">
              Gobernanza integral, clasificación automatizada con IA Gemini y certificación forense bajo normas internacionales ISO 12944 y SSPC.
            </p>

            {/* Los 5 Elementos Clave Solicitados */}
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Control de proyectos
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Trazabilidad en tiempo real, especificación técnica y wizard guiado de 9 pasos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Evidencia fotográfica
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Certificación de integridad con hashing criptográfico SHA-256 e inmutabilidad.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Reportes
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Informes ejecutivos automáticos, cálculo de rendimiento y certificación de obra.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Auditoría
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Bitácora forense de eventos, control RBAC y cumplimiento normativo NACE.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Gestión de clientes
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Aislamiento estricto de información empresarial mediante Row Level Security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de seguridad en lado izquierdo */}
          <div className="pt-8 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Supabase Auth Cloud & RLS Activo</span>
            </div>
            <span>TLS 1.3 / ISO 12944</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LADO DERECHO: FORMULARIO DE ACCESO CORPORATIVO */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Encabezado del Formulario */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  Portal Corporativo
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Iniciar sesión
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ingrese sus credenciales registradas para acceder a su espacio de trabajo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRegistrationModalOpen(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Solicitar acceso</span>
              </button>
            </div>

            {/* Banner de Registro Exitoso con Notificación de Bienvenida */}
            {registrationNotice && (
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 text-slate-800 text-xs shadow-xs space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Usuario Registrado! Saludo de bienvenida enviado</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Hola <strong>{registrationNotice.user.name}</strong>, tu cuenta ha sido creada exitosamente. Hemos enviado el correo oficial de bienvenida con tus credenciales y acceso a: <strong className="text-blue-900 font-mono">{registrationNotice.email.to}</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEmailViewerOpen(true)}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 rounded-lg text-[11px] flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ver Correo de Bienvenida Recibido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoginSuccess(registrationNotice.user)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Entrar con esta cuenta</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Banner de Error si ocurre */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Formulario Principal */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Correo electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Recordar sesión & Link: ¿Olvidó su contraseña? */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Recordar sesión
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetStatus('idle');
                    setResetMessage('');
                    setIsResetModalOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              {/* Botón principal: Iniciar sesión */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#1E3A8A] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-md shadow-blue-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando en Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Link: Solicitar acceso / Crear cuenta */}
            <div className="text-center pt-4 pb-2">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">
                    ¿No dispones de cuenta corporativa?
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Regístrate en línea y recibe de inmediato tu saludo de bienvenida por correo.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegistrationModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
                >
                  <span>Registrarse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>


          </div>

          {/* Footer del Formulario */}
          <div className="pt-4 text-center border-t border-slate-100 text-[10px] text-slate-400">
            COLORLINK SaaS • Control de Acceso Basado en Roles (RBAC) & Supabase Auth Cloud
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: RECUPERACIÓN DE CONTRASEÑA (supabase.auth.resetPasswordForEmail) */}
      {/* ========================================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Restablecer Contraseña
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ingrese su correo electrónico corporativo registrado. El sistema enviará un enlace seguro de Supabase Auth para restablecer su contraseña.
            </p>

            {resetStatus === 'success' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Enlace de recuperación enviado</span>
                </div>
                <p className="text-[11px] leading-snug">{resetMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Entendido, volver al inicio
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetStatus === 'error' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {resetMessage}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo electrónico corporativo
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center space-x-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === 'loading'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {resetStatus === 'loading' ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar enlace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PLANTILLA DE REGISTRO DE USUARIO & SOLICITUD DE ACCESO */}
      {/* ========================================================================= */}
      <UserRegistrationModal
        isOpen={isRegistrationModalOpen || isRequestAccessModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false);
          setIsRequestAccessModalOpen(false);
        }}
        onRegistrationSuccess={handleRegistrationCompleted}
        onAutoLogin={onLoginSuccess}
      />

      {/* ========================================================================= */}
      {/* MODAL: VISOR DE CORREO DE BIENVENIDA RECIBIDO */}
      {/* ========================================================================= */}
      {registrationNotice?.email && (
        <WelcomeEmailViewerModal
          email={registrationNotice.email}
          isOpen={isEmailViewerOpen}
          onClose={() => setIsEmailViewerOpen(false)}
          createdUser={registrationNotice.user}
          onAutoLogin={onLoginSuccess}
        />
      )}
    </div>
  );
};
