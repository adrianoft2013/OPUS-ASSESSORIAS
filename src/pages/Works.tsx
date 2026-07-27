import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, HardHat, X, Building2, User, Phone, MapPin, Calendar, Save, Trash2, Edit2, ArrowLeft, Briefcase, Mail } from 'lucide-react';
import { useApp } from '../AppContext';
import { Work, Subcontractor } from '../types';
import { cn } from '../lib/utils';

const Works: React.FC = () => {
  const { works, companies, addWork, updateWork, deleteWork, employees, subcontractors, addSubcontractor } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Subcontractor association states
  const [isSubcontractorSelectOpen, setIsSubcontractorSelectOpen] = useState(false);
  const [isNewSubcontractorOpen, setIsNewSubcontractorOpen] = useState(false);
  const [subSearchTerm, setSubSearchTerm] = useState('');
  
  // New subcontractor form state
  const [newSubForm, setNewSubForm] = useState({
    name: '',
    cnpj: '',
    phone: '',
    address: '',
    city: '',
    uf: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });
  
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return localStorage.getItem('draft_work_open') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedWork, setSelectedWork] = useState<Work | null>(() => {
    try {
      const saved = localStorage.getItem('draft_work_selected');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState<Partial<Work>>(() => {
    try {
      const saved = localStorage.getItem('draft_work_values');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // States for viewing work detail sheet ("ficha")
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [workToView, setWorkToView] = useState<Work | null>(null);

  // Reset view to list when user clicks Obras in sidebar
  useEffect(() => {
    setIsModalOpen(false);
    setIsDetailOpen(false);
    setSelectedWork(null);
    setWorkToView(null);
  }, [location.key]);

  // Synchronize modal state, selected work and form data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('draft_work_open', String(isModalOpen));
    } catch (e) {
      console.error(e);
    }
  }, [isModalOpen]);

  useEffect(() => {
    try {
      if (selectedWork) {
        localStorage.setItem('draft_work_selected', JSON.stringify(selectedWork));
      } else {
        localStorage.removeItem('draft_work_selected');
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedWork]);

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('draft_work_values', JSON.stringify(formData));
      } catch (e) {
        console.error(e);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [formData]);

  const handleOpenModal = (work?: Work) => {
    if (work) {
      setSelectedWork(work);
      setFormData(work);
    } else {
      setSelectedWork(null);
      // Keep draft values if they exist, otherwise initialize empty
      const saved = localStorage.getItem('draft_work_values');
      if (!saved) {
        setFormData({});
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWork(null);
    setFormData({});
    try {
      localStorage.removeItem('draft_work_open');
      localStorage.removeItem('draft_work_selected');
      localStorage.removeItem('draft_work_values');
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDetail = (work: Work) => {
    setWorkToView(work);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setWorkToView(null);
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
      alert('Erro ao salvar a obra. Verifique sua conexão.');
    }
  };

  const handleDeleteWork = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a obra "${name}"?`)) {
      try {
        await deleteWork(id);
        if (isDetailOpen && workToView?.id === id) {
          handleCloseDetail();
        }
        if (isModalOpen && selectedWork?.id === id) {
          handleCloseModal();
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir a obra.');
      }
    }
  };

  const handleAddSubcontractorToWork = async (subId: string) => {
    if (!workToView) return;
    const currentIds = workToView.subcontractorIds || [];
    if (currentIds.includes(subId)) {
      alert('Esta terceirizada já está vinculada a esta obra.');
      return;
    }
    const updatedIds = [...currentIds, subId];
    const updatedWork = { ...workToView, subcontractorIds: updatedIds };
    
    // Update local state and backend
    setWorkToView(updatedWork);
    await updateWork(workToView.id, { subcontractorIds: updatedIds });
    setIsSubcontractorSelectOpen(false);
  };

  const handleRemoveSubcontractorFromWork = async (subId: string) => {
    if (!workToView) return;
    if (confirm('Tem certeza que deseja desvincular esta terceirizada desta obra?')) {
      const currentIds = workToView.subcontractorIds || [];
      const updatedIds = currentIds.filter(id => id !== subId);
      const updatedWork = { ...workToView, subcontractorIds: updatedIds };
      
      setWorkToView(updatedWork);
      await updateWork(workToView.id, { subcontractorIds: updatedIds });
    }
  };

  const handleSaveNewSubcontractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubForm.name.trim()) {
      alert('Razão Social / Nome é obrigatório.');
      return;
    }
    try {
      const newId = await addSubcontractor(newSubForm);
      
      // Auto-associate to the current work
      if (workToView) {
        const currentIds = workToView.subcontractorIds || [];
        const updatedIds = [...currentIds, newId];
        const updatedWork = { ...workToView, subcontractorIds: updatedIds };
        
        setWorkToView(updatedWork);
        await updateWork(workToView.id, { subcontractorIds: updatedIds });
      }
      
      // Reset form and close new subcontractor modal
      setNewSubForm({
        name: '',
        cnpj: '',
        phone: '',
        address: '',
        city: '',
        uf: '',
        contactName: '',
        contactPhone: '',
        contactEmail: ''
      });
      setIsNewSubcontractorOpen(false);
      setIsSubcontractorSelectOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar terceirizada:', error);
      alert('Ocorreu um erro ao cadastrar a terceirizada.');
    }
  };

  const filteredWorks = works.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDocStatusClassAndText = (doc: any) => {
    const status = doc?.status || (doc?.dueDate ? 'Conforme' : '');
    
    let displayValue = '---';
    let colorClass = 'text-gray-400';
    
    if (status === 'Não se aplica' || status === 'N/A') {
      displayValue = 'N/A';
      colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase border';
    } else if (status === 'Não conforme' || status === 'N/C') {
      displayValue = 'N/C';
      colorClass = 'text-red-700 bg-red-50 border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase border';
    } else if (status === 'Conforme') {
      if (doc?.dueDate) {
        displayValue = new Date(doc.dueDate).toLocaleDateString('pt-BR');
        
        const today = new Date();
        const expiration = new Date(doc.dueDate);
        const diffTime = expiration.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          colorClass = 'text-red-700 bg-red-50 border-red-200 px-2 py-0.5 rounded text-[10px] font-bold border';
        } else if (diffDays <= 30) {
          colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold border';
        } else {
          colorClass = 'text-green-700 bg-green-50 border-green-200 px-2 py-0.5 rounded text-[10px] font-bold border';
        }
      } else {
        displayValue = 'Conforme';
        colorClass = 'text-green-700 bg-green-50 border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase border';
      }
    }

    return { displayValue, colorClass };
  };

  const renderOtherStatus = (val: string | undefined) => {
    if (!val) return <span className="text-gray-400">---</span>;
    
    let colorClass = "bg-gray-50 text-gray-500 border-gray-200";
    if (val === 'Conforme') {
      colorClass = "bg-green-50 text-green-700 border-green-200";
    } else if (val === 'Não se aplica' || val === 'N/A') {
      colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
    } else if (val === 'Não conforme' || val === 'N/C') {
      colorClass = "bg-red-50 text-red-700 border-red-200";
    }

    return (
      <span className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
        colorClass
      )}>
        {val}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {!isModalOpen && !isDetailOpen ? (
        <>
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
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredWorks.length > 0 ? (
                filteredWorks.map((work) => (
                  <tr 
                    key={work.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(work)}
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleOpenModal(work)}
                          className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteWork(work.id, work.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        </>
      ) : isModalOpen ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedWork ? 'Editar Obra' : 'Cadastrar Nova Obra'}
              </h1>
              <p className="text-gray-500">Insira os dados da obra abaixo.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
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
                    onClick={() => handleDeleteWork(selectedWork.id, selectedWork.name)}
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
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <button onClick={handleCloseDetail} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ficha da Obra</h1>
              <p className="text-gray-500">Detalhes completos do canteiro</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informações da Obra</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-500 block">Nome da Obra</span>
                    <span className="font-medium text-gray-950">{workToView.name}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-500 block">Construtora</span>
                    <span className="font-medium text-gray-950 flex items-center gap-1.5">
                      <Building2 size={14} className="text-gray-400" />
                      {workToView.companyName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Cidade / UF</span>
                    <span className="font-medium text-gray-950">{workToView.city} - {workToView.uf}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Data de Cadastro</span>
                    <span className="font-medium text-gray-950">
                      {workToView.createdAt ? new Date(workToView.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações de Contato / Responsável */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Responsável Técnico</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">Engenheiro / Responsável</span>
                    <span className="font-medium text-gray-950">{workToView.responsible || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Telefone / WhatsApp</span>
                    <span className="font-medium text-gray-950">{workToView.phone || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Listagem de Funcionários da Obra */}
              <div className="pt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Funcionários Alocados nesta Obra</h3>
                {(() => {
                  const workEmployees = employees.filter(emp => emp.workId === workToView.id && emp.status === 'active');
                  if (workEmployees.length === 0) {
                    return (
                      <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-gray-100 text-sm text-gray-500">
                        Nenhum funcionário ativo cadastrado para esta obra.
                      </div>
                    );
                  }
                  return (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left border-b border-gray-200">
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Funcionário</th>
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Terceirizada</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">EPI</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">ASO</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">NR06</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">NR10</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">NR12</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">NR18</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">NR35</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Ordem de Serviço</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Ficha de Registro</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Contrato de Trabalho</th>
                            <th className="px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">e-Social</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {workEmployees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900">{emp.name}</div>
                                <div className="text-[10px] text-gray-400">{emp.role}</div>
                              </td>
                              <td className="px-4 py-3">
                                {emp.contractorName ? (
                                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-brand bg-brand/5 border border-brand/10 px-2.5 py-1 rounded-lg">
                                    <Briefcase size={12} className="shrink-0" />
                                    <span>{emp.contractorName}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                                    Próprio
                                  </span>
                                )}
                              </td>
                              {['EPI', 'ASO', 'NR06', 'NR10', 'NR12', 'NR18', 'NR35'].map(type => {
                                const doc = emp.documents?.find(d => d.type === type);
                                const { displayValue, colorClass } = getDocStatusClassAndText(doc);
                                return (
                                  <td key={type} className="px-3 py-3 text-center">
                                    <div className="flex justify-center">
                                      <span className={cn("whitespace-nowrap", colorClass)}>
                                        {displayValue}
                                      </span>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="px-3 py-3 text-center">
                                <div className="flex justify-center">
                                  {renderOtherStatus(emp.serviceOrder)}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex justify-center">
                                  {renderOtherStatus(emp.registrationRecord)}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex justify-center">
                                  {renderOtherStatus(emp.employmentContract)}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex justify-center">
                                  {renderOtherStatus(emp.esocial)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Relação de Terceirizadas da Obra */}
              <div className="pt-6 border-t border-gray-100 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Empresas Terceirizadas Prestadoras de Serviço</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Terceirizadas associadas para prestação de serviços nesta obra.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubSearchTerm('');
                      setIsSubcontractorSelectOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 hover:bg-brand/10 text-brand text-xs font-semibold rounded-lg border border-brand/10 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Incluir Terceirizada
                  </button>
                </div>

                {(() => {
                  const associatedSubs = subcontractors.filter(sub => 
                    (workToView.subcontractorIds || []).includes(sub.id)
                  );

                  if (associatedSubs.length === 0) {
                    return (
                      <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100 text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
                        <Briefcase size={24} className="text-gray-300" />
                        <span>Nenhuma empresa terceirizada vinculada a esta obra.</span>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left border-b border-gray-200">
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Razão Social / Nome</th>
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">CNPJ</th>
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Localização</th>
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Contato / Telefone</th>
                            <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {associatedSubs.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-gray-900">
                                <div className="flex items-center gap-1.5">
                                  <Briefcase size={14} className="text-brand shrink-0" />
                                  <span>{sub.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                {sub.cnpj || '-'}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600">
                                {sub.city ? `${sub.city} - ${sub.uf}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600">
                                {sub.contactName ? (
                                  <div>
                                    <div className="font-semibold text-gray-800">{sub.contactName}</div>
                                    {sub.contactPhone && <div className="text-gray-400 font-mono text-[10px]">{sub.contactPhone}</div>}
                                  </div>
                                ) : (
                                  sub.phone ? <span className="font-mono">{sub.phone}</span> : '-'
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubcontractorFromWork(sub.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                  title="Desvincular Terceirizada"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCloseDetail();
                  handleOpenModal(workToView);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand text-white font-medium rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Editar Obra
              </button>
              <button
                type="button"
                onClick={() => handleDeleteWork(workToView.id, workToView.name)}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Excluir Obra
              </button>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: SELECIONAR TERCEIRIZADA            */}
      {/* ========================================== */}
      {isSubcontractorSelectOpen && workToView && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-950 text-lg flex items-center gap-2">
                  <Briefcase size={20} className="text-brand" />
                  Incluir Terceirizada na Obra
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Selecione uma terceirizada para esta obra</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSubcontractorSelectOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar terceirizada por nome, CNPJ..."
                  value={subSearchTerm}
                  onChange={(e) => setSubSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {(() => {
                const availableSubs = subcontractors.filter(sub => {
                  const alreadyLinked = (workToView.subcontractorIds || []).includes(sub.id);
                  const matchesSearch = sub.name.toLowerCase().includes(subSearchTerm.toLowerCase()) || 
                    (sub.cnpj && sub.cnpj.includes(subSearchTerm));
                  return !alreadyLinked && matchesSearch;
                });

                if (availableSubs.length === 0) {
                  return (
                    <div className="text-center py-10 text-gray-500 text-sm">
                      {subSearchTerm ? 'Nenhuma terceirizada encontrada para sua busca.' : 'Todas as terceirizadas cadastradas já estão vinculadas a esta obra.'}
                    </div>
                  );
                }

                return availableSubs.map(sub => (
                  <div 
                    key={sub.id} 
                    onClick={() => handleAddSubcontractorToWork(sub.id)}
                    className="p-3 bg-white hover:bg-brand/5 border border-gray-200 hover:border-brand/20 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-brand transition-colors text-sm">{sub.name}</div>
                      {sub.cnpj && <div className="text-xs text-gray-400 font-mono mt-0.5">CNPJ: {sub.cnpj}</div>}
                      {sub.city && <div className="text-xs text-gray-500 mt-1">{sub.city} - {sub.uf}</div>}
                    </div>
                    <span className="text-[10px] font-bold text-brand bg-brand/5 border border-brand/10 px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                      Selecionar
                    </span>
                  </div>
                ));
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSubcontractorSelectOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CADASTRAR TERCEIRIZADA (POPUP)     */}
      {/* ========================================== */}
      {isNewSubcontractorOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-950 text-lg flex items-center gap-2">
                  <Briefcase size={20} className="text-brand" />
                  Cadastrar Nova Terceirizada
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Preencha os dados abaixo para cadastrar a terceirizada.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsNewSubcontractorOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewSubcontractor} className="overflow-y-auto p-6 space-y-5 flex-1">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informações da Empresa</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Razão Social / Nome Fantasia *</label>
                    <input
                      type="text"
                      required
                      value={newSubForm.name}
                      onChange={(e) => setNewSubForm({ ...newSubForm, name: e.target.value })}
                      placeholder="Ex: Construtora Alfa Ltda"
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">CNPJ</label>
                      <input
                        type="text"
                        value={newSubForm.cnpj}
                        onChange={(e) => setNewSubForm({ ...newSubForm, cnpj: e.target.value })}
                        placeholder="Ex: 00.000.000/0001-00"
                        className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Telefone da Empresa</label>
                      <input
                        type="text"
                        value={newSubForm.phone}
                        onChange={(e) => setNewSubForm({ ...newSubForm, phone: e.target.value })}
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={newSubForm.address}
                      onChange={(e) => setNewSubForm({ ...newSubForm, address: e.target.value })}
                      placeholder="Ex: Av. Paulista, 1000 - Cj 50"
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={newSubForm.city}
                        onChange={(e) => setNewSubForm({ ...newSubForm, city: e.target.value })}
                        placeholder="Ex: São Paulo"
                        className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">UF</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={newSubForm.uf}
                        onChange={(e) => setNewSubForm({ ...newSubForm, uf: e.target.value.toUpperCase() })}
                        placeholder="SP"
                        className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informações de Contato</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do Contato</label>
                    <input
                      type="text"
                      value={newSubForm.contactName}
                      onChange={(e) => setNewSubForm({ ...newSubForm, contactName: e.target.value })}
                      placeholder="Ex: João Silva"
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Celular</label>
                      <input
                        type="text"
                        value={newSubForm.contactPhone}
                        onChange={(e) => setNewSubForm({ ...newSubForm, contactPhone: e.target.value })}
                        placeholder="Ex: (11) 98888-8888"
                        className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail de Contato</label>
                      <input
                        type="email"
                        value={newSubForm.contactEmail}
                        onChange={(e) => setNewSubForm({ ...newSubForm, contactEmail: e.target.value })}
                        placeholder="Ex: contato@empresa.com"
                        className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsNewSubcontractorOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Salvar e Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Works;
