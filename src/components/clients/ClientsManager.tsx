import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Search, 
  Plus, 
  FolderKanban, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { Client, Project } from '../../types';

interface ClientsManagerProps {
  clients: Client[];
  projects: Project[];
  onAddClient: (newClient: Client) => void;
  onSelectClientProjects: (clientName: string) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  clients,
  projects,
  onAddClient,
  onSelectClientProjects,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form for new client
  const [form, setForm] = useState({
    companyName: '',
    taxId: '',
    contactName: '',
    email: '',
    phone: '',
    city: 'Bogotá',
    address: '',
    industry: 'Industrial' as const,
  });

  const filteredClients = clients.filter(c => {
    const matchSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.includes(searchQuery) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchIndustry = selectedIndustry === 'Todas' || c.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.taxId) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      companyName: form.companyName,
      taxId: form.taxId,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      address: form.address,
      industry: form.industry,
      status: 'Activo',
      createdAt: new Date().toISOString().substring(0, 10),
      totalProjects: 0,
    };

    onAddClient(newClient);
    setIsModalOpen(false);
    setForm({
      companyName: '',
      taxId: '',
      contactName: '',
      email: '',
      phone: '',
      city: 'Bogotá',
      address: '',
      industry: 'Industrial',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Gestión CRM de Cuentas Corporativas</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Directorio de Clientes & Contratistas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de empresas industriales, contactos clave, historial de proyectos y estados de cuenta.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por razón social, NIT, contacto..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 font-medium"
          >
            <option value="Todas">Todos los sectores</option>
            <option value="Industrial">Industrial</option>
            <option value="Construcción">Construcción</option>
            <option value="Marino">Marino</option>
            <option value="Petroquímica">Petroquímica</option>
            <option value="Comercial">Comercial</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter(p => p.clientId === client.id || p.clientName === client.companyName);

          return (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      NIT: {client.taxId}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {client.companyName}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {client.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate"><strong>Contacto:</strong> {client.contactName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.city} • {client.address || 'Sede Central'}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectClientProjects(client.companyName)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Ver {clientProjects.length} Proyectos</span>
                </button>

                <span className="text-[11px] font-semibold text-slate-400">
                  {client.industry}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal New Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">
                Registrar Nuevo Cliente Corporativo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Razón Social *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Ej: Cementos Argos S.A."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIT / RUC *</label>
                  <input
                    type="text"
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    placeholder="900.123.456-7"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector Industrial</label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="Industrial">Industrial</option>
                    <option value="Construcción">Construcción</option>
                    <option value="Marino">Marino</option>
                    <option value="Petroquímica">Petroquímica</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Contacto</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Ing. María Casas"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+57 312 000 0000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="compras@argos.co"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Barranquilla"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dirección Sede</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Zona Franca Km 3"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
