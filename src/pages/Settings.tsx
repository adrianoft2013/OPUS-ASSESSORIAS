import React, { useState } from 'react';
import { Building2, Save, Camera, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';

const Settings: React.FC = () => {
  const { companyData, updateCompanyData } = useApp();
  const [name, setName] = useState(companyData.name);
  const [logoUrl, setLogoUrl] = useState(companyData.logoUrl || '');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateCompanyData({ name, logoUrl });
    alert('Dados da empresa salvos com sucesso!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dados da Empresa</h1>
        <p className="text-gray-500">Configure as informações que aparecerão nos relatórios.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Logo da Empresa</label>
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                    <button 
                      onClick={() => setLogoUrl('')}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Trash2 size={24} />
                    </button>
                  </>
                ) : (
                  <Building2 className="text-gray-300" size={48} />
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-brand-hover transition-colors">
                  <Camera size={18} />
                  Fazer Upload da Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <p className="text-xs text-gray-400">Recomendado: PNG ou JPG, fundo transparente.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nome da Empresa</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Construtora Exemplo Ltda"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none font-medium"
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-hover transition-all shadow-lg shadow-brand/10"
            >
              <Save size={20} />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
