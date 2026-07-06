import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, X, Building2, Phone, Mail, MapPin, Calendar, 
  User, Edit2, Trash2, ArrowLeft, Briefcase
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Subcontractor } from '../types';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';

const Subcontractors: React.FC = () => {
  const { subcontractors, addSubcontractor, updateSubcontractor, deleteSubcontractor } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return localStorage.getItem('draft_subcontractor_open') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedSubcontractor, setSelectedSubcontractor] = useState<Subcontractor | null>(() => {
    try {
      const saved = localStorage.getItem('draft_subcontractor_selected');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [formValues, setFormValues] = useState(() => {
    try {
      const saved = localStorage.getItem('draft_subcontractor_values');
      return saved ? JSON.parse(saved) : {
        name: '',
        cnpj: '',
        address: '',
        phone: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        city: '',
        uf: '',
        documents: {
          pgr_quantificacao: { status: 'C' },
          pgr_cronograma: { status: 'C' },
          pgr_calibracao: { status: 'C' },
          pgr_medicoes: { status: 'C' },
          pcmso_diretrizes: { status: 'C' },
          pcmso_relatorio: { status: 'C' },
          pcmso_cronograma: { status: 'C' },
          pcmso_aso: { status: 'C' },
          cipa_processo_eleitoral: { status: 'C' },
          cipa_ata_posse: { status: 'C' },
          cipa_calendario_reunioes: { status: 'C' },
          cipa_treinamento: { status: 'C' },
          livro_inspecao: { status: 'C' },
          livro_por_estabelecimento: { status: 'C' },
          analise_riscos: { status: 'C' },
          negativas_sticc: { status: 'C' },
          certidao_fgts: { status: 'C' },
          dctfweb: { status: 'C' },
          seguro_vida: { status: 'C' }
        }
      };
    } catch {
      return {
        name: '',
        cnpj: '',
        address: '',
        phone: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        city: '',
        uf: '',
        documents: {
          pgr_quantificacao: { status: 'C' },
          pgr_cronograma: { status: 'C' },
          pgr_calibracao: { status: 'C' },
          pgr_medicoes: { status: 'C' },
          pcmso_diretrizes: { status: 'C' },
          pcmso_relatorio: { status: 'C' },
          pcmso_cronograma: { status: 'C' },
          pcmso_aso: { status: 'C' },
          cipa_processo_eleitoral: { status: 'C' },
          cipa_ata_posse: { status: 'C' },
          cipa_calendario_reunioes: { status: 'C' },
          cipa_treinamento: { status: 'C' },
          livro_inspecao: { status: 'C' },
          livro_por_estabelecimento: { status: 'C' },
          analise_riscos: { status: 'C' },
          negativas_sticc: { status: 'C' },
          certidao_fgts: { status: 'C' },
          dctfweb: { status: 'C' },
          seguro_vida: { status: 'C' }
        }
      };
    }
  });

  // States for viewing subcontractor detail sheet ("ficha")
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [subcontractorToView, setSubcontractorToView] = useState<Subcontractor | null>(null);

  // Reset views on navigation click (from sidebar)
  useEffect(() => {
    setIsModalOpen(false);
    setIsDetailOpen(false);
    setSelectedSubcontractor(null);
    setSubcontractorToView(null);
  }, [location.key]);

  // Synchronize state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('draft_subcontractor_open', String(isModalOpen));
    } catch (e) {
      console.error(e);
    }
  }, [isModalOpen]);

  useEffect(() => {
    try {
      if (selectedSubcontractor) {
        localStorage.setItem('draft_subcontractor_selected', JSON.stringify(selectedSubcontractor));
      } else {
        localStorage.removeItem('draft_subcontractor_selected');
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedSubcontractor]);

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('draft_subcontractor_values', JSON.stringify(formValues));
      } catch (e) {
        console.error(e);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [formValues]);

  const handleOpenModal = (subcontractor?: Subcontractor) => {
    if (subcontractor) {
      setSelectedSubcontractor(subcontractor);
      setFormValues({
        name: subcontractor.name || '',
        cnpj: subcontractor.cnpj || '',
        address: subcontractor.address || '',
        phone: subcontractor.phone || '',
        contactName: subcontractor.contactName || '',
        contactPhone: subcontractor.contactPhone || '',
        contactEmail: subcontractor.contactEmail || '',
        city: subcontractor.city || '',
        uf: subcontractor.uf || '',
        documents: subcontractor.documents || {
          pgr_quantificacao: { status: 'C' },
          pgr_cronograma: { status: 'C' },
          pgr_calibracao: { status: 'C' },
          pgr_medicoes: { status: 'C' },
          pcmso_diretrizes: { status: 'C' },
          pcmso_relatorio: { status: 'C' },
          pcmso_cronograma: { status: 'C' },
          pcmso_aso: { status: 'C' },
          cipa_processo_eleitoral: { status: 'C' },
          cipa_ata_posse: { status: 'C' },
          cipa_calendario_reunioes: { status: 'C' },
          cipa_treinamento: { status: 'C' },
          livro_inspecao: { status: 'C' },
          livro_por_estabelecimento: { status: 'C' },
          analise_riscos: { status: 'C' },
          negativas_sticc: { status: 'C' },
          certidao_fgts: { status: 'C' },
          dctfweb: { status: 'C' },
          seguro_vida: { status: 'C' }
        }
      });
    } else {
      setSelectedSubcontractor(null);
      const savedVals = localStorage.getItem('draft_subcontractor_values');
      if (!savedVals) {
        setFormValues({
          name: '',
          cnpj: '',
          address: '',
          phone: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          city: '',
          uf: '',
          documents: {
            pgr_quantificacao: { status: 'C' },
            pgr_cronograma: { status: 'C' },
            pgr_calibracao: { status: 'C' },
            pgr_medicoes: { status: 'C' },
            pcmso_diretrizes: { status: 'C' },
            pcmso_relatorio: { status: 'C' },
            pcmso_cronograma: { status: 'C' },
            pcmso_aso: { status: 'C' },
            cipa_processo_eleitoral: { status: 'C' },
            cipa_ata_posse: { status: 'C' },
            cipa_calendario_reunioes: { status: 'C' },
            cipa_treinamento: { status: 'C' },
            livro_inspecao: { status: 'C' },
            livro_por_estabelecimento: { status: 'C' },
            analise_riscos: { status: 'C' },
            negativas_sticc: { status: 'C' },
            certidao_fgts: { status: 'C' },
            dctfweb: { status: 'C' },
            seguro_vida: { status: 'C' }
          }
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubcontractor(null);
    try {
      localStorage.removeItem('draft_subcontractor_values');
      localStorage.removeItem('draft_subcontractor_open');
      localStorage.removeItem('draft_subcontractor_selected');
      localStorage.removeItem('draft_subcontractor_documents');
    } catch (e) {
      console.error(e);
    }
    setFormValues({
      name: '',
      cnpj: '',
      address: '',
      phone: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      city: '',
      uf: '',
      documents: {
        pgr_quantificacao: { status: 'C' },
        pgr_cronograma: { status: 'C' },
        pgr_calibracao: { status: 'C' },
        pgr_medicoes: { status: 'C' },
        pcmso_diretrizes: { status: 'C' },
        pcmso_relatorio: { status: 'C' },
        pcmso_cronograma: { status: 'C' },
        pcmso_aso: { status: 'C' },
        cipa_processo_eleitoral: { status: 'C' },
        cipa_ata_posse: { status: 'C' },
        cipa_calendario_reunioes: { status: 'C' },
        cipa_treinamento: { status: 'C' },
        livro_inspecao: { status: 'C' },
        livro_por_estabelecimento: { status: 'C' },
        analise_riscos: { status: 'C' },
        negativas_sticc: { status: 'C' },
        certidao_fgts: { status: 'C' },
        dctfweb: { status: 'C' },
        seguro_vida: { status: 'C' }
      }
    });
  };

  const handleOpenDetail = (subcontractor: Subcontractor) => {
    setSubcontractorToView(subcontractor);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSubcontractorToView(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a empresa terceirizada "${name}"?`)) {
      try {
        await deleteSubcontractor(id);
        if (isDetailOpen && subcontractorToView?.id === id) {
          handleCloseDetail();
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir empresa terceirizada.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { 
      ...formValues
    };

    try {
      if (selectedSubcontractor) {
        await updateSubcontractor(selectedSubcontractor.id, data);
      } else {
        await addSubcontractor(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar os dados.');
    }
  };

  const filteredSubcontractors = subcontractors.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.cnpj && s.cnpj.includes(searchTerm))
  );

  return (
    <div className="space-y-8" id="subcontractors-container">
      {!isModalOpen && !isDetailOpen ? (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Empresas Terceirizadas</h1>
              <p className="text-gray-500">Gerencie e visualize as empresas terceirizadas cadastradas no sistema.</p>
            </div>
            
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
            >
              <Plus size={20} />
              Nova Terceirizada
            </button>
          </div>

          {/* Search and Table Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por Razão Social, CNPJ ou Cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all text-sm"
                />
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50/50">
                    <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Razão Social</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Cidade / UF</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Ponto de Contato</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Data Cadastro</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 text-sm text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubcontractors.length > 0 ? (
                    filteredSubcontractors.map((sub) => (
                      <tr 
                        key={sub.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleOpenDetail(sub)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{sub.name}</div>
                          {sub.cnpj && (
                            <div className="text-xs text-gray-400 font-mono">CNPJ: {sub.cnpj}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {sub.city ? `${sub.city} - ${sub.uf}` : '---'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {sub.contactName ? (
                            <div>
                              <div className="font-medium text-gray-800">{sub.contactName}</div>
                              {sub.contactPhone && (
                                <div className="text-xs text-gray-400">{sub.contactPhone}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">---</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleOpenModal(sub)}
                              className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(sub.id, sub.name)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
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
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma terceirizada encontrada</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                          {searchTerm ? 'Experimente mudar os termos da busca ou limpar o campo de texto.' : 'Cadastre sua primeira empresa terceirizada para começar a gerenciar.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : isModalOpen ? (
        /* CADASTRO / EDIÇÃO FORM */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={22} className="text-brand" />
              {selectedSubcontractor ? 'Editar Terceirizada' : 'Cadastrar Terceirizada'}
            </h2>
            <button 
              onClick={handleCloseModal}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Secao 1: Dados Gerais */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand uppercase tracking-wider pb-1 border-b border-gray-100">
                  Informações da Empresa
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    value={formValues.name}
                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    placeholder="Ex: Alvenaria & Acabamentos Ltda"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={formValues.cnpj}
                      onChange={(e) => setFormValues({ ...formValues, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Comercial</label>
                    <input
                      type="text"
                      value={formValues.phone}
                      onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                      placeholder="(00) 0000-0000"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={formValues.address}
                    onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                    placeholder="Rua, número, bairro..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formValues.city}
                      onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                      placeholder="Ex: São Paulo"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formValues.uf}
                      onChange={(e) => setFormValues({ ...formValues, uf: e.target.value.toUpperCase() })}
                      placeholder="Ex: SP"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Secao 2: Contato */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand uppercase tracking-wider pb-1 border-b border-gray-100">
                  Ponto de Contato
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Contato</label>
                  <input
                    type="text"
                    value={formValues.contactName}
                    onChange={(e) => setFormValues({ ...formValues, contactName: e.target.value })}
                    placeholder="Nome do encarregado ou gestor"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp / Telefone</label>
                    <input
                      type="text"
                      value={formValues.contactPhone}
                      onChange={(e) => setFormValues({ ...formValues, contactPhone: e.target.value })}
                      placeholder="(00) 90000-0000"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                    <input
                      type="email"
                      value={formValues.contactEmail}
                      onChange={(e) => setFormValues({ ...formValues, contactEmail: e.target.value })}
                      placeholder="contato@empresa.com"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Secao 3: Controle de Documentação */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand uppercase tracking-wider pb-1 border-b border-gray-100">
                  Controle de Documentação
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">PGR</h4>
                    
                    {/* PGR - Quantificação */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantificação dos riscos ambientais
                        </label>
                        <select
                          value={formValues.documents?.pgr_quantificacao?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_quantificacao: {
                                ...formValues.documents?.pgr_quantificacao,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pgr_quantificacao?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_quantificacao: {
                                ...formValues.documents?.pgr_quantificacao,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* PGR - Cronograma */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cumprimento do Cronograma de Ações
                        </label>
                        <select
                          value={formValues.documents?.pgr_cronograma?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_cronograma: {
                                ...formValues.documents?.pgr_cronograma,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pgr_cronograma?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_cronograma: {
                                ...formValues.documents?.pgr_cronograma,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* PGR - Certificado de Calibração */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Certificado de Calibração dos Equipamentos
                        </label>
                        <select
                          value={formValues.documents?.pgr_calibracao?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_calibracao: {
                                ...formValues.documents?.pgr_calibracao,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pgr_calibracao?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_calibracao: {
                                ...formValues.documents?.pgr_calibracao,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* PGR - Medições por Estabelecimento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Medições por Estabelecimento (Inventário de Riscos)
                        </label>
                        <select
                          value={formValues.documents?.pgr_medicoes?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_medicoes: {
                                ...formValues.documents?.pgr_medicoes,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pgr_medicoes?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pgr_medicoes: {
                                ...formValues.documents?.pgr_medicoes,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PCMSO CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">PCMSO</h4>
                    
                    {/* PCMSO - Diretrizes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Exames de Acordo com Risco e Função
                        </label>
                        <select
                          value={formValues.documents?.pcmso_diretrizes?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_diretrizes: {
                                ...formValues.documents?.pcmso_diretrizes,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pcmso_diretrizes?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_diretrizes: {
                                ...formValues.documents?.pcmso_diretrizes,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* PCMSO - Relatório Analítico */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Exames Apto para Trabalhar em Altura
                        </label>
                        <select
                          value={formValues.documents?.pcmso_relatorio?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_relatorio: {
                                ...formValues.documents?.pcmso_relatorio,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pcmso_relatorio?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_relatorio: {
                                ...formValues.documents?.pcmso_relatorio,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* PCMSO - Cronograma */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Médico Coordenador
                        </label>
                        <select
                          value={formValues.documents?.pcmso_cronograma?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_cronograma: {
                                ...formValues.documents?.pcmso_cronograma,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pcmso_cronograma?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_cronograma: {
                                ...formValues.documents?.pcmso_cronograma,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* PCMSO - ASO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Médicos Examinadores de Acordo com o ASO
                        </label>
                        <select
                          value={formValues.documents?.pcmso_aso?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_aso: {
                                ...formValues.documents?.pcmso_aso,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.pcmso_aso?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              pcmso_aso: {
                                ...formValues.documents?.pcmso_aso,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CIPA CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">CIPA</h4>
                    
                    {/* CIPA - Processo Eleitoral */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Dimensionamento Conforme Quadro I NR05
                        </label>
                        <select
                          value={formValues.documents?.cipa_processo_eleitoral?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_processo_eleitoral: {
                                ...formValues.documents?.cipa_processo_eleitoral,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.cipa_processo_eleitoral?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_processo_eleitoral: {
                                ...formValues.documents?.cipa_processo_eleitoral,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* CIPA - Ata de Posse */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Designado da CIPA
                        </label>
                        <select
                          value={formValues.documents?.cipa_ata_posse?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_ata_posse: {
                                ...formValues.documents?.cipa_ata_posse,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.cipa_ata_posse?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_ata_posse: {
                                ...formValues.documents?.cipa_ata_posse,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* CIPA - Calendário de Reuniões */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                          Certificado
                         </label>
                        <select
                          value={formValues.documents?.cipa_calendario_reunioes?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_calendario_reunioes: {
                                ...formValues.documents?.cipa_calendario_reunioes,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.cipa_calendario_reunioes?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_calendario_reunioes: {
                                ...formValues.documents?.cipa_calendario_reunioes,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* CIPA - Treinamento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Comunicado de Designação
                        </label>
                        <select
                          value={formValues.documents?.cipa_treinamento?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_treinamento: {
                                ...formValues.documents?.cipa_treinamento,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.cipa_treinamento?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              cipa_treinamento: {
                                ...formValues.documents?.cipa_treinamento,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LIVRO DE INSPEÇÃO DO TRABALHO CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">LIVRO DE INSPEÇÃO DO TRABALHO</h4>
                    
                    {/* Livro de Inspeção do Trabalho */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Preenchimento de Todos os Dados
                        </label>
                        <select
                          value={formValues.documents?.livro_inspecao?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              livro_inspecao: {
                                ...formValues.documents?.livro_inspecao,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.livro_inspecao?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              livro_inspecao: {
                                ...formValues.documents?.livro_inspecao,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-2"></div>

                    {/* Por Estabelecimento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Por Estabelecimento
                        </label>
                        <select
                          value={formValues.documents?.livro_por_estabelecimento?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              livro_por_estabelecimento: {
                                ...formValues.documents?.livro_por_estabelecimento,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Data do Documento
                        </label>
                        <input
                          type="date"
                          value={formValues.documents?.livro_por_estabelecimento?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              livro_por_estabelecimento: {
                                ...formValues.documents?.livro_por_estabelecimento,
                                date: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ANÁLISE DE RISCOS E PROCEDIMENTOS OPERACIONAIS CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">ANÁLISE DE RISCOS E PROCEDIMENTOS OPERACIONAIS</h4>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={formValues.documents?.analise_riscos?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              analise_riscos: {
                                ...formValues.documents?.analise_riscos,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="px-2.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <input
                          type="date"
                          value={formValues.documents?.analise_riscos?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              analise_riscos: {
                                ...formValues.documents?.analise_riscos,
                                date: e.target.value
                              }
                            }
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* NEGATIVAS STICC CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">NEGATIVAS STICC</h4>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={formValues.documents?.negativas_sticc?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              negativas_sticc: {
                                ...formValues.documents?.negativas_sticc,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="px-2.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <input
                          type="date"
                          value={formValues.documents?.negativas_sticc?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              negativas_sticc: {
                                ...formValues.documents?.negativas_sticc,
                                date: e.target.value
                              }
                            }
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CERTIDÃO REGULARIDADE FGTS CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">CERTIDÃO REGULARIDADE FGTS</h4>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={formValues.documents?.certidao_fgts?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              certidao_fgts: {
                                ...formValues.documents?.certidao_fgts,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="px-2.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <input
                          type="date"
                          value={formValues.documents?.certidao_fgts?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              certidao_fgts: {
                                ...formValues.documents?.certidao_fgts,
                                date: e.target.value
                              }
                            }
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DCTFWEB CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">DCTFWEB</h4>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={formValues.documents?.dctfweb?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              dctfweb: {
                                ...formValues.documents?.dctfweb,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="px-2.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <input
                          type="date"
                          value={formValues.documents?.dctfweb?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              dctfweb: {
                                ...formValues.documents?.dctfweb,
                                date: e.target.value
                              }
                            }
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEGURO DE VIDA CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">SEGURO DE VIDA</h4>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={formValues.documents?.seguro_vida?.status || 'C'}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              seguro_vida: {
                                ...formValues.documents?.seguro_vida,
                                status: e.target.value as 'C' | 'N/C' | 'N/A'
                              }
                            }
                          })}
                          className="px-2.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        >
                          <option value="C">Confere</option>
                          <option value="N/C">N/C</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <input
                          type="date"
                          value={formValues.documents?.seguro_vida?.date || ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            documents: {
                              ...formValues.documents,
                              seguro_vida: {
                                ...formValues.documents?.seguro_vida,
                                date: e.target.value
                              }
                            }
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all text-xs bg-white font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Salvar Terceirizada
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* DETAIL VIEW SHEET / "FICHA COMPLETA" */
        subcontractorToView && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4 text-left">
              <button onClick={handleCloseDetail} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ficha da Terceirizada</h1>
                <p className="text-gray-500">Detalhes completos da empresa</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Ficha Body */}
              <div className="p-6 space-y-6">
              {/* Secao 1: Identificacao */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5 text-left">
                  Dados da Terceirizada
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-left">
                  <div>
                    <span className="text-gray-400 block text-xs">Razão Social / Nome Fantasia</span>
                    <span className="font-semibold text-gray-900">{subcontractorToView.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">CNPJ</span>
                    <span className="font-mono text-gray-900 font-medium">{subcontractorToView.cnpj || 'Não Informado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Telefone Comercial</span>
                    <span className="text-gray-900 font-medium">{subcontractorToView.phone || 'Não Informado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Data de Cadastro</span>
                    <div className="flex items-center gap-1.5 text-gray-900 font-medium mt-0.5">
                      <Calendar size={14} className="text-gray-400 shrink-0" />
                      <span>{new Date(subcontractorToView.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm pt-2 text-left">
                  <span className="text-gray-400 block text-xs">Endereço Completo</span>
                  <div className="flex items-start gap-1.5 text-gray-900 font-medium mt-1">
                    <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <span>{subcontractorToView.address || 'Não Informado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-2 text-left">
                  <div>
                    <span className="text-gray-400 block text-xs">Cidade</span>
                    <span className="text-gray-900 font-medium">{subcontractorToView.city || 'Não Informado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Estado (UF)</span>
                    <span className="text-gray-900 font-medium uppercase">{subcontractorToView.uf || 'Não Informado'}</span>
                  </div>
                </div>
              </div>

              {/* Secao 2: Ponto de Contato */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5 text-left">
                  Informações de Contato
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-left">
                  <div>
                    <span className="text-gray-400 block text-xs">Nome do Contato Principal</span>
                    <div className="flex items-center gap-1.5 text-gray-900 font-medium mt-0.5">
                      <User size={14} className="text-brand shrink-0" />
                      <span>{subcontractorToView.contactName || 'Não Informado'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">WhatsApp / Telefone</span>
                    <div className="flex items-center gap-1.5 text-gray-900 font-medium mt-0.5">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      {subcontractorToView.contactPhone ? (
                        <a 
                          href={`https://wa.me/${subcontractorToView.contactPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand hover:underline font-medium"
                        >
                          {subcontractorToView.contactPhone}
                        </a>
                      ) : (
                        <span>Não Informado</span>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-xs">E-Mail do Contato</span>
                    <div className="flex items-center gap-1.5 text-gray-900 font-medium mt-0.5">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      {subcontractorToView.contactEmail ? (
                        <a 
                          href={`mailto:${subcontractorToView.contactEmail}`}
                          className="hover:text-brand hover:underline font-medium"
                        >
                          {subcontractorToView.contactEmail}
                        </a>
                      ) : (
                        <span>Não Informado</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Secao 3: Controle de Documentação */}
              <div className="space-y-4 pt-4 border-t border-gray-100 text-left">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">
                  Controle de Documentação
                </h3>

                <div className="space-y-3">
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">PGR</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Quantificação dos riscos ambientais</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pgr_quantificacao?.status || 'C';
                          const docDate = subcontractorToView.documents?.pgr_quantificacao?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_quantificacao: {
                                        ...subcontractorToView.documents?.pgr_quantificacao,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_quantificacao: {
                                        ...subcontractorToView.documents?.pgr_quantificacao,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Cumprimento do Cronograma de Ações</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pgr_cronograma?.status || 'C';
                          const docDate = subcontractorToView.documents?.pgr_cronograma?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_cronograma: {
                                        ...subcontractorToView.documents?.pgr_cronograma,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_cronograma: {
                                        ...subcontractorToView.documents?.pgr_cronograma,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Certificado de Calibração dos Equipamentos</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pgr_calibracao?.status || 'C';
                          const docDate = subcontractorToView.documents?.pgr_calibracao?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_calibracao: {
                                        ...subcontractorToView.documents?.pgr_calibracao,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_calibracao: {
                                        ...subcontractorToView.documents?.pgr_calibracao,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Medições por Estabelecimento (Inventário de Riscos)</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pgr_medicoes?.status || 'C';
                          const docDate = subcontractorToView.documents?.pgr_medicoes?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_medicoes: {
                                        ...subcontractorToView.documents?.pgr_medicoes,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pgr_medicoes: {
                                        ...subcontractorToView.documents?.pgr_medicoes,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">PCMSO</span>
                    </div>

                    {/* PCMSO - Diretrizes */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Exames de Acordo com Risco e Função</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pcmso_diretrizes?.status || 'C';
                          const docDate = subcontractorToView.documents?.pcmso_diretrizes?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_diretrizes: {
                                        ...subcontractorToView.documents?.pcmso_diretrizes,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_diretrizes: {
                                        ...subcontractorToView.documents?.pcmso_diretrizes,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* PCMSO - Relatório Analítico */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Exames Apto para Trabalhar em Altura</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pcmso_relatorio?.status || 'C';
                          const docDate = subcontractorToView.documents?.pcmso_relatorio?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_relatorio: {
                                        ...subcontractorToView.documents?.pcmso_relatorio,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_relatorio: {
                                        ...subcontractorToView.documents?.pcmso_relatorio,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* PCMSO - Cronograma */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Médico Coordenador</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pcmso_cronograma?.status || 'C';
                          const docDate = subcontractorToView.documents?.pcmso_cronograma?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_cronograma: {
                                        ...subcontractorToView.documents?.pcmso_cronograma,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_cronograma: {
                                        ...subcontractorToView.documents?.pcmso_cronograma,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* PCMSO - ASO */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Médicos Examinadores de Acordo com o ASO</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.pcmso_aso?.status || 'C';
                          const docDate = subcontractorToView.documents?.pcmso_aso?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_aso: {
                                        ...subcontractorToView.documents?.pcmso_aso,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      pcmso_aso: {
                                        ...subcontractorToView.documents?.pcmso_aso,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">CIPA</span>
                    </div>

                    {/* CIPA - Processo Eleitoral */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Dimensionamento Conforme Quadro I NR05</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.cipa_processo_eleitoral?.status || 'C';
                          const docDate = subcontractorToView.documents?.cipa_processo_eleitoral?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_processo_eleitoral: {
                                        ...subcontractorToView.documents?.cipa_processo_eleitoral,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_processo_eleitoral: {
                                        ...subcontractorToView.documents?.cipa_processo_eleitoral,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* CIPA - Ata de Posse */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Designado da CIPA</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.cipa_ata_posse?.status || 'C';
                          const docDate = subcontractorToView.documents?.cipa_ata_posse?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_ata_posse: {
                                        ...subcontractorToView.documents?.cipa_ata_posse,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_ata_posse: {
                                        ...subcontractorToView.documents?.cipa_ata_posse,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* CIPA - Calendário de Reuniões */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Certificado</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.cipa_calendario_reunioes?.status || 'C';
                          const docDate = subcontractorToView.documents?.cipa_calendario_reunioes?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_calendario_reunioes: {
                                        ...subcontractorToView.documents?.cipa_calendario_reunioes,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_calendario_reunioes: {
                                        ...subcontractorToView.documents?.cipa_calendario_reunioes,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* CIPA - Treinamento */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Comunicado de Designação</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.cipa_treinamento?.status || 'C';
                          const docDate = subcontractorToView.documents?.cipa_treinamento?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_treinamento: {
                                        ...subcontractorToView.documents?.cipa_treinamento,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      cipa_treinamento: {
                                        ...subcontractorToView.documents?.cipa_treinamento,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* LIVRO DE INSPEÇÃO DO TRABALHO CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">LIVRO DE INSPEÇÃO DO TRABALHO</span>
                    </div>

                    {/* Livro de Inspeção do Trabalho */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Preenchimento de Todos os Dados</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.livro_inspecao?.status || 'C';
                          const docDate = subcontractorToView.documents?.livro_inspecao?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      livro_inspecao: {
                                        ...subcontractorToView.documents?.livro_inspecao,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      livro_inspecao: {
                                        ...subcontractorToView.documents?.livro_inspecao,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Por Estabelecimento */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-500 font-medium text-xs block">Por Estabelecimento</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.livro_por_estabelecimento?.status || 'C';
                          const docDate = subcontractorToView.documents?.livro_por_estabelecimento?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      livro_por_estabelecimento: {
                                        ...subcontractorToView.documents?.livro_por_estabelecimento,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>

                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      livro_por_estabelecimento: {
                                        ...subcontractorToView.documents?.livro_por_estabelecimento,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* ANÁLISE DE RISCOS E PROCEDIMENTOS OPERACIONAIS CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm">ANÁLISE DE RISCOS E PROCEDIMENTOS OPERACIONAIS</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.analise_riscos?.status || 'C';
                          const docDate = subcontractorToView.documents?.analise_riscos?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      analise_riscos: {
                                        ...subcontractorToView.documents?.analise_riscos,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>
 
                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      analise_riscos: {
                                        ...subcontractorToView.documents?.analise_riscos,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* NEGATIVAS STICC CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm">NEGATIVAS STICC</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.negativas_sticc?.status || 'C';
                          const docDate = subcontractorToView.documents?.negativas_sticc?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      negativas_sticc: {
                                        ...subcontractorToView.documents?.negativas_sticc,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>
 
                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      negativas_sticc: {
                                        ...subcontractorToView.documents?.negativas_sticc,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* CERTIDÃO REGULARIDADE FGTS CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm">CERTIDÃO REGULARIDADE FGTS</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.certidao_fgts?.status || 'C';
                          const docDate = subcontractorToView.documents?.certidao_fgts?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      certidao_fgts: {
                                        ...subcontractorToView.documents?.certidao_fgts,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>
 
                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      certidao_fgts: {
                                        ...subcontractorToView.documents?.certidao_fgts,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* DCTFWEB CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm">DCTFWEB</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.dctfweb?.status || 'C';
                          const docDate = subcontractorToView.documents?.dctfweb?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      dctfweb: {
                                        ...subcontractorToView.documents?.dctfweb,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>
 
                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      dctfweb: {
                                        ...subcontractorToView.documents?.dctfweb,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* SEGURO DE VIDA CARD */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm">SEGURO DE VIDA</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(() => {
                          const status = subcontractorToView.documents?.seguro_vida?.status || 'C';
                          const docDate = subcontractorToView.documents?.seguro_vida?.date || '';
                          let colorClass = 'text-green-700 bg-green-50 border-green-200 focus:ring-green-500';
                          
                          if (status === 'N/C') {
                            colorClass = 'text-red-700 bg-red-50 border-red-200 focus:ring-red-500';
                          } else if (status === 'N/A') {
                            colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200 focus:ring-yellow-500';
                          }
                          
                          return (
                            <>
                              <select
                                value={status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as 'C' | 'N/C' | 'N/A';
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      seguro_vida: {
                                        ...subcontractorToView.documents?.seguro_vida,
                                        status: newStatus
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded text-xs font-bold border cursor-pointer outline-none transition-colors bg-transparent",
                                  colorClass
                                )}
                              >
                                <option value="C" className="bg-white text-green-700">Confere</option>
                                <option value="N/C" className="bg-white text-red-700">N/C</option>
                                <option value="N/A" className="bg-white text-yellow-700">N/A</option>
                              </select>
 
                              <input
                                type="date"
                                value={docDate}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  const updatedSub = {
                                    ...subcontractorToView,
                                    documents: {
                                      ...subcontractorToView.documents,
                                      seguro_vida: {
                                        ...subcontractorToView.documents?.seguro_vida,
                                        status: status,
                                        date: newDate
                                      }
                                    }
                                  };
                                  setSubcontractorToView(updatedSub);
                                  await updateSubcontractor(subcontractorToView.id, updatedSub);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium border border-gray-300 outline-none focus:ring-1 focus:ring-brand focus:border-brand bg-white"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ficha Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => handleDelete(subcontractorToView.id, subcontractorToView.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
              >
                <Trash2 size={14} />
                Excluir Cadastro
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg font-medium text-xs transition-colors cursor-pointer bg-white"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    const current = subcontractorToView;
                    handleCloseDetail();
                    handleOpenModal(current);
                  }}
                  className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Editar Cadastro
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    )}
    </div>
  );
};

export default Subcontractors;
