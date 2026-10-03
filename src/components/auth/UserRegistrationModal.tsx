import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Phone, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Send, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Inbox,
  Layers
} from 'lucide-react';
import { UserRole, UserRegistrationData, User, WelcomeEmailMessage } from '../../types';
import { apiService } from '../../services/apiService';
import { WelcomeEmailViewerModal } from './WelcomeEmailViewerModal';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: (user: User, email: WelcomeEmailMessage) => void;
  onAutoLogin?: (user: User) => void;
  initialRole?: UserRole;
}

export const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistrationSuccess,
  onAutoLogin,
  initialRole = 'Cliente'
}) => {
  // Form State
  const [formData, setFormData] = useState<UserRegistrationData>({
    name: '',
    email: '',
    password: '',
    companyName: '',
    taxId: '',
    phone: '',
    position: '',
    role: initialRole,
    department: 'Operaciones e Ingeniería',
    industrySector: 'Petroquímica & Energía',
    city: 'Bogotá D.C.',
    acceptTerms: true,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendWelcomeEmailChecked, setSendWelcomeEmailChecked] = useState(true);

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStepText, setSubmitStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success State
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [dispatchedEmail, setDispatchedEmail] = useState<WelcomeEmailMessage | null>(null);
  const [isPreviewEmailOpen, setIsPreviewEmailOpen] = useState(false);

  if (!isOpen) return null;

  // Validation
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Por favor ingrese su nombre y apellido completo.');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Por favor ingrese una dirección de correo corporativo válida.');
      return false;
    }
    if (!formData.companyName.trim()) {
      setErrorMessage('Por favor ingrese el nombre de su empresa u organización.');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (formData.password && formData.password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Verifique los campos.');
      return false;
    }
    if (!formData.acceptTerms) {
      setErrorMessage('Debe aceptar los términos y condiciones para continuar.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitStepText('Creando credenciales seguras de acceso...');

      // Usar contraseña por defecto si está vacía
      const finalPassword = formData.password?.trim() || 'ColorLink2026*';

      await new Promise(r => setTimeout(r, 400));
      setSubmitStepText(`Generando saludo oficial de bienvenida y plantilla corporativa para ${formData.email}...`);

      const result = await apiService.registerUser({
        ...formData,
        password: finalPassword,
      });

      await new Promise(r => setTimeout(r, 400));
      setSubmitStepText(`Enviando correo de bienvenida a ${formData.email}...`);

      setRegisteredUser(result.user);
      setDispatchedEmail(result.welcomeEmail);

      onRegistrationSuccess(result.user, result.welcomeEmail);
    } catch (err: any) {
      console.error('Error registrando usuario:', err);
      setErrorMessage(err.message || 'Error al procesar el registro corporativo.');
    } finally {
      setIsSubmitting(false);
      setSubmitStepText('');
    }
  };

  const handleAutoLoginClick = () => {
    if (registeredUser && onAutoLogin) {
      onAutoLogin(registeredUser);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 sm:p-8 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                      Registro de Usuario
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Plataforma COLORLINK
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Plantilla de Solicitud & Registro
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-3 relative z-10 leading-relaxed max-w-xl">
              Complete los datos corporativos de su cuenta. Al registrarse, recibirá inmediatamente un <strong>correo oficial con su saludo de bienvenida</strong>, credenciales y guía técnica.
            </p>
          </div>

          {/* Form Content / Success View */}
          <div className="p-6 sm:p-8">
            {registeredUser && dispatchedEmail ? (
              // VISTA DE ÉXITO TRAS REGISTRO & ENVÍO DE CORREO
              <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 text-slate-800 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                          ¡Usuario Registrado Exitosamente!
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        ¡Bienvenido a COLORLINK, {registeredUser.name}!
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Tu cuenta corporativa para <strong>{registeredUser.companyName || formData.companyName}</strong> con perfil de <strong>{registeredUser.role}</strong> ha sido aprovisionada en el sistema.
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta de Notificación del Correo de Bienvenida Enviado */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                    <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-900">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Saludo de Bienvenida Enviado por Correo:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="truncate">
                        <span className="text-[11px] text-slate-500 block">Destinatario oficial:</span>
                        <span className="text-xs font-bold text-blue-700 font-mono truncate block">
                          {dispatchedEmail.to}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Entregado / Listo</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      El correo incluye el saludo oficial de la dirección técnica, el código de verificación único (<strong>{dispatchedEmail.activationCode}</strong>) y las instrucciones de uso de la plataforma.
                    </p>
                  </div>
                </div>

                {/* Botones de Acción Primarios */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewEmailOpen(true)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-600 flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Inbox className="w-4 h-4 text-blue-600" />
                    <span>Ver Correo de Bienvenida Recibido</span>
                  </button>

                  {onAutoLogin && (
                    <button
                      type="button"
                      onClick={handleAutoLoginClick}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <span>Iniciar Sesión Automáticamente</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4 cursor-pointer"
                  >
                    Cerrar y volver a la pantalla de acceso
                  </button>
                </div>
              </div>
            ) : (
              // FORMULARIO COMPLETO DE REGISTRO
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* SECCIÓN 1: DATOS PERSONALES Y CORREO */}
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
                    <UserIcon className="w-4 h-4" />
                    <span>1. Datos de Contacto y Acceso</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nombre y Apellidos *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ej. Ing. Mateo Gómez"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Correo Corporativo * <span className="text-[10px] text-blue-600 font-normal">(Recibirá el saludo)</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="m.gomez@empresa.com"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-blue-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contraseña de Acceso
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres (o por defecto)"
                          className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita su contraseña"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: INFORMACIÓN CORPORATIVA */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
                    <Building2 className="w-4 h-4" />
                    <span>2. Organización y Empresa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nombre de la Empresa / Razón Social *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="Ej. Petroquímica Andina S.A."
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        NIT / Identificación Tributaria
                      </label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        placeholder="Ej. 900.567.890-1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cargo o Especialidad
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="Ej. Gerente de Calidad"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Teléfono / Móvil
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+57 310 123 4567"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sector Industrial
                      </label>
                      <select
                        value={formData.industrySector}
                        onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      >
                        <option value="Petroquímica & Energía">Petroquímica & Energía</option>
                        <option value="Infraestructura Vial & Puentes">Infraestructura Vial & Puentes</option>
                        <option value="Construcción & Obras Civiles">Construcción & Obras Civiles</option>
                        <option value="Marino & Portuario">Marino & Portuario</option>
                        <option value="Minería & Metales">Minería & Metales</option>
                        <option value="Manufactura & Industrial">Manufactura & Industrial</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: ROL & PERMISOS */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Perfil de Acceso Solicitado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label 
                      className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                        formData.role === 'Cliente'
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestedRole"
                        checked={formData.role === 'Cliente'}
                        onChange={() => setFormData({ ...formData, role: 'Cliente' })}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Cliente Corporativo (Empresa)
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-snug">
                          Acceso a proyectos de su organización, evidencias fotográficas SHA-256 y reportes ejecutivos.
                        </span>
                      </div>
                    </label>

                    <label 
                      className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                        formData.role === 'Auditor'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestedRole"
                        checked={formData.role === 'Auditor'}
                        onChange={() => setFormData({ ...formData, role: 'Auditor' })}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Auditor Técnico (NACE / AMPP)
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-snug">
                          Validación técnica de recubrimientos, trazabilidad ambiental y certificación de calidad.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* NOTA DEL CORREO DE BIENVENIDA & TÉRMINOS */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-2.5">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-blue-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmailChecked}
                      onChange={(e) => setSendWelcomeEmailChecked(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>
                      Enviar saludo oficial de bienvenida y credenciales al correo ingresado ({formData.email || 'correo corporativo'})
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>
                      Acepto el tratamiento de datos y políticas de seguridad y confidencialidad COLORLINK.
                    </span>
                  </label>
                </div>

                {/* BOTONES DE ENVÍO */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 flex items-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{submitStepText || 'Procesando...'}</span>
                      </>
                    ) : (
                      <>
                        <span>Registrarme y Recibir Saludo de Bienvenida</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal visor del correo de bienvenida recibido */}
      {dispatchedEmail && (
        <WelcomeEmailViewerModal
          email={dispatchedEmail}
          isOpen={isPreviewEmailOpen}
          onClose={() => setIsPreviewEmailOpen(false)}
          createdUser={registeredUser}
          onAutoLogin={onAutoLogin}
        />
      )}
    </>
  );
};
