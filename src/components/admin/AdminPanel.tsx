import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Users, 
  Key, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  FileText,
  Database,
  Cpu,
  Mail,
  Inbox,
  Eye,
  Send,
  Sparkles
} from 'lucide-react';
import { User, AuditLog, WelcomeEmailMessage } from '../../types';
import { CURRENT_USER, INITIAL_AUDIT_LOGS } from '../../data/initialData';
import { apiService } from '../../services/apiService';
import { WelcomeEmailViewerModal } from '../auth/WelcomeEmailViewerModal';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'audit' | 'emails' | 'config'>('roles');
  const [dispatchedEmails, setDispatchedEmails] = useState<WelcomeEmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<WelcomeEmailMessage | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>(INITIAL_AUDIT_LOGS);
  const [registeredUsersList, setRegisteredUsersList] = useState<User[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const emails = await apiService.getDispatchedEmails();
        setDispatchedEmails(emails);
      } catch (e) {
        console.warn('Error cargando emails:', e);
      }

      try {
        const logs = await apiService.getAuditLogs();
        if (logs && logs.length > 0) {
          setAuditLogs(logs);
        }
      } catch (e) {
        console.warn('Error cargando audit logs:', e);
      }

      try {
        const storedUsersRaw = localStorage.getItem('colorlink_registered_users');
        if (storedUsersRaw) {
          setRegisteredUsersList(JSON.parse(storedUsersRaw));
        }
      } catch {
        // Ignorar
      }
    }
    loadData();
  }, []);

  const baseUsersList: User[] = [
    CURRENT_USER,
    {
      id: 'usr-002',
      name: 'Ing. Laura Pardo',
      email: 'laura.pardo@colorlink.tech',
      role: 'Auditor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      department: 'Auditoría Técnica NACE & Trazabilidad',
    },
    {
      id: 'usr-cli-001',
      name: 'Ing. Roberto Silva',
      email: 'rsilva@petrocaribe.com.co',
      role: 'Cliente',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      department: 'Gerencia de Mantenimiento',
      companyName: 'Petroquímica del Caribe S.A.',
    },
  ];

  const allUsers = [
    ...registeredUsersList,
    ...baseUsersList.filter(bu => !registeredUsersList.some(ru => ru.email.toLowerCase() === bu.email.toLowerCase()))
  ];

  const permissionsMatrix = [
    { module: 'Gestión Completa del Sistema y Configuración', admin: true, auditor: false, cliente: false },
    { module: 'Gestión y Alta de Clientes / Empresas', admin: true, auditor: true, cliente: false },
    { module: 'Creación y Edición de Proyectos (Wizard 9 Pasos)', admin: true, auditor: false, cliente: true },
    { module: 'Consulta de Trazabilidad y Especificaciones', admin: true, auditor: true, cliente: true },
    { module: 'Inspección de Evidencias Fotográficas (SHA-256)', admin: true, auditor: true, cliente: true },
    { module: 'Ejecución y Revisión de Clasificación IA Gemini', admin: true, auditor: true, cliente: true },
    { module: 'Gestión de Inventario de Recubrimientos', admin: true, auditor: true, cliente: false },
    { module: 'Generación de Reportes Técnicos y Certificación', admin: true, auditor: true, cliente: true },
    { module: 'Consulta de Logs de Auditoría y Seguridad', admin: true, auditor: true, cliente: false },
    { module: 'Eliminación y Descarte de Registros', admin: true, auditor: false, cliente: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Gobernanza, Seguridad & Configuración</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Panel de Administración del Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de roles y permisos empresariales (RBAC), registro forense de auditoría y parámetros del modelo Gemini.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'roles' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Usuarios & Roles
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Logs de Auditoría
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'emails' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Correos Enviados</span>
            {dispatchedEmails.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                {dispatchedEmails.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'config' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Configuración IA
          </button>
        </div>
      </div>

      {/* TAB 1: ROLES & USERS */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Users List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              Personal Autorizado en COLORLINK
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allUsers.map(u => (
                <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100" />
                    <div className="min-w-0">
                      <strong className="text-xs text-slate-900 block truncate">{u.name}</strong>
                      <span className="text-[10px] text-slate-400 block truncate">{u.email}</span>
                      {u.companyName && (
                        <span className="text-[10px] text-blue-700 font-semibold block truncate">
                          {u.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Activo</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Matriz de Control de Acceso Basado en Roles (RBAC)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Módulo Funcional</th>
                    <th className="py-3 px-4 text-center">Administrador (Total)</th>
                    <th className="py-3 px-4 text-center">Auditor (Lectura & Trazabilidad)</th>
                    <th className="py-3 px-4 text-center">Cliente (Empresa Propia)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">{item.module}</td>
                      <td className="py-3 px-4 text-center">
                        {item.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.auditor ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.cliente ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Trazabilidad Pericial & Registro de Eventos
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Inmutable • Retención 5 Años
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log, idx) => (
              <div key={log.id || idx} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {log.targetType}: {log.targetId}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>

                <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono shrink-0">
                  <div>{log.user} ({log.role})</div>
                  <div>{log.timestamp} • IP: {log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCHED WELCOME EMAILS */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <Inbox className="w-4 h-4 text-blue-600" />
                <span>Bandeja de Correos de Bienvenida Enviados</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Historial de notificaciones y saludos de bienvenida oficiales remitidos a los usuarios que se registran en el sistema.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
              Total emitidos: {dispatchedEmails.length}
            </span>
          </div>

          {dispatchedEmails.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No hay correos de bienvenida emitidos aún</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Cuando un usuario complete la plantilla de solicitud o registro corporativo, su saludo de bienvenida oficial se listará aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Destinatario / Usuario</th>
                    <th className="py-3 px-4">Empresa / Rol</th>
                    <th className="py-3 px-4">Código de Activación</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchedEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{email.recipientName}</div>
                        <div className="text-[11px] text-blue-700 font-mono">{email.to}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{email.companyName || 'Empresa Aliada'}</div>
                        <div className="text-[10px] text-slate-400">{email.role || 'Cliente'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {email.activationCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {new Date(email.sentAt).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{email.status || 'Entregado'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmail(email)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs inline-flex items-center space-x-1.5 border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ver Plantilla</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-extrabold text-sm text-slate-900">
            Parámetros del Motor de Inteligencia y Estándares
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Modelo LLM Primario</span>
              <div className="flex items-center space-x-2 font-mono font-bold text-slate-900 text-sm">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>gemini-3.8-flash</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Configurado con responseMimeType: "application/json" para inferencia determinista de sistemas multicapa.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Estándar de Corrosión</span>
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ISO 12944:2018 (Partes 1 a 9)</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Clasificación de agresividad C1 a C5 y durabilidad requerida H (&gt; 15 años).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal visor del correo de bienvenida para administradores */}
      {selectedEmail && (
        <WelcomeEmailViewerModal
          email={selectedEmail}
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
};
