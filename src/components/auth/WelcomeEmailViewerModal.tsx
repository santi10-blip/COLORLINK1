import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Download, 
  Sparkles,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { WelcomeEmailMessage, User } from '../../types';

interface WelcomeEmailViewerModalProps {
  email: WelcomeEmailMessage;
  isOpen: boolean;
  onClose: () => void;
  onAutoLogin?: (user: User) => void;
  createdUser?: User | null;
}

export const WelcomeEmailViewerModal: React.FC<WelcomeEmailViewerModalProps> = ({
  email,
  isOpen,
  onClose,
  onAutoLogin,
  createdUser
}) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCredentials = () => {
    const credsText = `COLORLINK - Credenciales de Acceso\nUsuario / Correo: ${email.to}\nEmpresa: ${email.companyName || 'N/A'}\nCódigo de Activación: ${email.activationCode}\nFecha: ${new Date(email.sentAt).toLocaleString('es-CO')}`;
    navigator.clipboard.writeText(credsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadProof = () => {
    const blob = new Blob([email.textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `COLORLINK_Bienvenida_${email.to.replace(/[@.]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Email Client Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Bandeja de Entrada Corporativa
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Entregado a {email.to}</span>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                {email.subject}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === 'html' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Diseño HTML
              </button>
              <button
                type="button"
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === 'text' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Texto Plano
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Headers (Sender, Recipient, Date) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500 w-16">De:</span>
              <span className="font-semibold text-slate-900">
                COLORLINK Enterprise Platform &lt;bienvenida@colorlink.tech&gt;
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500 w-16">Para:</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {email.recipientName} &lt;{email.to}&gt;
              </span>
            </div>
          </div>
          <div className="space-y-1 sm:text-right">
            <div className="flex items-center sm:justify-end space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">
                {new Date(email.sentAt).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <div className="flex items-center sm:justify-end space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">
                Autenticado TLS / SPF & DKIM Válido
              </span>
            </div>
          </div>
        </div>

        {/* Email Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          {viewMode === 'html' ? (
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xs overflow-hidden border border-slate-200">
              <div 
                className="p-1 sm:p-2"
                dangerouslySetInnerHTML={{ __html: email.htmlContent }}
              />
            </div>
          ) : (
            <pre className="w-full max-w-3xl bg-slate-900 text-slate-100 p-6 rounded-2xl text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {email.textContent}
            </pre>
          )}
        </div>

        {/* Email Footer Toolbar with Quick Actions */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? '¡Copiado!' : 'Copiar Credenciales'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadProof}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Descargar .txt</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Cerrar Vista
            </button>

            {createdUser && onAutoLogin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAutoLogin(createdUser);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 flex items-center space-x-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>Ingresar a la Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
