import React, { useState, useEffect } from 'react';
import { Search, Plus, HardHat, X, Building2, User, Phone, MapPin, Calendar, Save, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { Work } from '../types';
import { cn } from '../lib/utils';

const Works: React.FC = () => {
  const { works, companies, addWork, updateWork, deleteWork } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState<Partial<Work>>({});

  useEffect(() => {
    if (selectedWork) {
      setFormData(selectedWork);
    } else {
      setFormData({});
    }
  }, [selectedWork, isModalOpen]);

  const handleOpenModal = (work?: Work) => {
    setSelectedWork(work || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWork(null);
  };

  const handleChange = (field: keyof Work, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const company = companies.find(c => c.id === formData.companyId);
    
    const data = {
      name: formData.name || '',
      companyId: formData.companyId || '',
      companyName: company?.name || 'N/A',
      responsible: formData.responsible || '',
      phone: formData.phone || '',
      city: formData.city || '',
      uf: formData.uf || '',
    };

    try {
      if (selectedWork) {
        await updateWork(selectedWork.id, data);
      } else {
        await addWork(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      alert('Erro ao salvar a obra. Verifique sua conexão e as configurações do Supabase.');
    }
  };

  const handleDelete = () => {
    if (selectedWork && confirm('Tem certeza que deseja excluir esta obra?')) {
      deleteWork(selectedWork.id);
      handleCloseModal();
    }
  };

  const filteredWorks = works.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
          <p className="text-gray-500">Controle e acompanhamento de canteiros.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
        >
          <Plus size={20} />
          Nova Obra
        </button>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por obra, construtora ou cidade..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Obra</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Construtora</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Cidade / UF</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredWorks.length > 0 ? (
                filteredWorks.map((work) => (
                  <tr 
                    key={work.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(work)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{work.name}</div>
                      <div className="text-xs text-gray-400">Resp: {work.responsible}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {work.companyName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {work.city} - {work.uf}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-900 transition-colors">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma obra encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedWork ? 'Editar Obra' : 'Nova Obra'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    <HardHat size={16} /> Nome da Obra
                  </label>
                  <input 
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required 
                    placeholder="Ex: Edifício Horizonte"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    <Building2 size={16} /> Construtora
                  </label>
                  <select 
                    value={formData.companyId || ''}
                    onChange={(e) => handleChange('companyId', e.target.value)}
                    required 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white font-medium"
                  >
                    <option value="">Selecione uma construtora</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    <User size={16} /> Responsável
                  </label>
                  <input 
                    value={formData.responsible || ''}
                    onChange={(e) => handleChange('responsible', e.target.value)}
                    required 
                    placeholder="Nome do engenheiro responsável"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    <Phone size={16} /> Telefone/WhatsApp
                  </label>
                  <input 
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required 
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    <MapPin size={16} /> Cidade
                  </label>
                  <input 
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required 
                    placeholder="Cidade da obra"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">UF</label>
                  <input 
                    value={formData.uf || ''}
                    onChange={(e) => handleChange('uf', e.target.value)}
                    required 
                    maxLength={2}
                    placeholder="UF"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none uppercase font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    <Calendar size={16} /> Data do Cadastro
                  </label>
                  <input 
                    type="date"
                    disabled
                    value={formData.createdAt || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                {selectedWork && (
                  <button 
                    type="button"
                    className="flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
                    onClick={handleDelete}
                  >
                    <Trash2 size={20} />
                    Excluir Obra
                  </button>
                )}
                <div className="flex gap-4 ml-auto">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-8 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-10 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-all shadow-lg shadow-brand/10"
                  >
                    <Save size={20} />
                    {selectedWork ? 'Salvar Alterações' : 'Cadastrar Obra'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Works;
