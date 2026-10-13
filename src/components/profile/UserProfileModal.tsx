import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Building2, 
  Phone, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  Key, 
  CheckCircle2, 
  LogOut, 
  Copy, 
  Sparkles, 
  Edit3, 
  Save, 
  AlertCircle,
  Layers,
  FolderKanban,
  FileText,
  Clock,
  ExternalLink,
  MapPin,
  BadgeCheck
} from 'lucide-react';
import { User, UserRole, Project } from '../../types';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser?: (updated: User) => void;
  onOpenWelcomeEmail?: () => void;
  userProjectsCount?: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onUpdateUser,
  onOpenWelcomeEmail,
  userProjectsCount = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Formulario de edición
  const [editData, setEditData] = useState({
    name: user.name || '',
    phone: user.phone || '+57 300 123 4567',
    position: user.position || user.department || 'Ingeniería Técnica',
    department: user.department || 'Operaciones y Corrosión',
    city: user.city || 'Bogotá D.C., Colombia',
  });

  useEffect(() => {
    setEditData({
      name: user.name || '',
      phone: user.phone || '+57 300 123 4567',
      position: user.position || user.department || 'Ingeniería Técnica',
      department: user.department || 'Operaciones y Corrosión',
      city: user.city || 'Bogotá D.C., Colombia',
    });
  }, [user]);

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    if (!name) return 'CL';
    const clean = name.replace(/^(Ing\.|Arq\.|Cap\.|Dr\.|Lic\.)\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Auditor':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cliente':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveProfile = () => {
    const updated: User = {
      ...user,
      name: editData.name,
      phone: editData.phone,
      position: editData.position,
      department: editData.department,
      city: editData.city,
    };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsEditing(false);
  };

  const getPermissionsForRole = (role: UserRole) => {
    switch (role) {
      case 'Administrador':
        return [
          'Gestión total de proyectos, clientes e inventario',
          'Aprovisionamiento y administración de usuarios (RBAC)',
          'Ejecución del motor de clasificación IA Gemini 3.8 Flash',
          'Consulta y exportación forense de registros de auditoría',
          'Configuración global del sistema y arquitectura',
        ];
      case 'Auditor':
        return [
          'Inspección técnica de proyectos y especificaciones ISO 12944',
          'Verificación pericial de evidencias fotográficas (Hash SHA-256)',
          'Revisión y validación de sistemas recomendados por IA',
          'Emisión de dictámenes y reportes de certificación técnica',
          'Monitoreo inmutable de trazabilidad y condiciones ambientales',
        ];
      case 'Cliente':
        return [
          'Acceso exclusivo a los proyectos de su organización empresarial',
          'Creación de solicitudes con el Wizard guiado de 9 pasos',
          'Carga y visualización de evidencias fotográficas de obra',
          'Consulta de clasificaciones técnicas y reportes ejecutivos',
          'Aislamiento estricto de datos con seguridad por rol (RLS)',
        ];
      default:
        return ['Acceso estándar de consulta'];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Corporativo */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E3A8A] p-6 text-white relative shrink-0">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center font-bold text-lg ring-4 ring-white/10 shadow-lg shadow-blue-500/30">
                {getInitials(user.name)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                    Perfil de Usuario
                  </span>
                  <span className="text-[10px] font-bold text-slate-300">
                    COLORLINK Enterprise
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {user.name}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Subtitle / Badge Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs">
            <span className={`px-2.5 py-0.5 rounded-md font-bold border text-[11px] ${getRoleBadgeStyle(user.role)}`}>
              Rol: {user.role}
            </span>
            {user.companyName && (
              <span className="px-2.5 py-0.5 rounded-md font-medium bg-white/10 text-slate-200 border border-white/15 flex items-center space-x-1 text-[11px]">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span>{user.companyName}</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-md font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sesión Activa</span>
            </span>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Alerta de Cierre de Sesión en Confirmación */}
          {showLogoutConfirm && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-rose-950">
                    ¿Confirmas que deseas cerrar tu sesión en COLORLINK?
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    Se cerrará la sesión actual de forma segura y serás redirigido a la pantalla de inicio de sesión institucional.
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-1.5 rounded-xl border border-rose-300 text-xs font-semibold text-rose-800 hover:bg-rose-100/70 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        onClose();
                        onLogout();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sí, Cerrar Sesión Ahora</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 1: DATOS PERSONALES Y CONTACTO */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-800">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>1. Información Personal y de Contacto</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
              >
                {isEditing ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Datos</span>
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Posición</label>
                    <input
                      type="text"
                      value={editData.position}
                      onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento / Área</label>
                    <input
                      type="text"
                      value={editData.department}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Nombre Completo</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{user.name}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Correo Corporativo</span>
                    <span className="font-bold text-blue-700 block mt-0.5 truncate">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.email, 'email')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="Copiar correo"
                  >
                    {copiedField === 'email' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Teléfono / Móvil</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{user.phone || editData.phone}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cargo / Especialidad</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{user.position || user.department || editData.position}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Departamento / Área</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{user.department || editData.department}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ubicación / Ciudad</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{user.city || editData.city}</span>
                </div>

                {user.activationCode && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Código de Activación / Credencial</span>
                      <span className="font-mono font-bold text-indigo-700 block mt-0.5">{user.activationCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.activationCode || '', 'code')}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copiar código de activación"
                    >
                      {copiedField === 'code' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: ORGANIZACIÓN Y EMPRESA */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>2. Organización y Empresa Vinculada</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Razón Social</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">
                  {user.companyName || 'COLORLINK Enterprise Tech'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {user.taxId ? `Identificación Fiscal (NIT): ${user.taxId}` : 'Entidad Registrada y Certificada'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Proyectos Activos</span>
                <span className="font-black text-blue-600 text-xl block mt-0.5">
                  {userProjectsCount}
                </span>
                <span className="text-[10px] text-slate-400 block">Asignados a su perfil</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: PERMISOS Y GOBERNANZA RBAC */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>3. Permisos Habilitados para el Rol: {user.role}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <ul className="space-y-2 text-xs text-slate-700">
                {getPermissionsForRole(user.role).map((perm, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>ID Usuario: <code className="font-mono text-slate-700">{user.id.slice(0, 16)}...</code></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Último acceso: {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-CO') : 'Sesión activa'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Toolbar: Acciones Principales */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onOpenWelcomeEmail && (
              <button
                type="button"
                onClick={onOpenWelcomeEmail}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Ver Saludo de Bienvenida</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Cerrar la sesión de COLORLINK"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Cerrar Sesión</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
