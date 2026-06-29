import React, { useState } from 'react';
import { Search, Plus, X, Building2, Phone, Mail, MapPin, Calendar, User, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { Company } from '../types';
import { cn } from '../lib/utils';

const Companies: React.FC = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // States for viewing company detail sheet ("ficha")
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [companyToView, setCompanyToView] = useState<Company | null>(null);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (company?: Company) => {
    setSelectedCompany(company || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const handleOpenDetail = (company: Company) => {
    setCompanyToView(company);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setCompanyToView(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a construtora "${name}"?`)) {
      try {
        await deleteCompany(id);
        if (isDetailOpen && companyToView?.id === id) {
          handleCloseDetail();
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir construtora.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      contactName: formData.get('contactName') as string,
      contactPhone: formData.get('contactPhone') as string,
      contactEmail: formData.get('contactEmail') as string,
      city: formData.get('city') as string,
      uf: formData.get('uf') as string,
    };

    try {
      if (selectedCompany) {
        await updateCompany(selectedCompany.id, data);
      } else {
        await addCompany(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar os dados. Verifique sua conexão e as configurações do Supabase.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Construtoras</h1>
          <p className="text-gray-500">Gerencie as construtoras parceiras.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
        >
          <Plus size={20} />
          Nova Construtora
        </button>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou cidade..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Nome</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Cidade / UF</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Data Cadastro</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr 
                    key={company.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(company)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-400">{company.cnpj}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {company.city} - {company.uf}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleOpenModal(company)}
                          className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(company.id, company.name)}
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
                    Nenhuma construtora encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCompany ? 'Editar Construtora' : 'Cadastrar Nova Construtora'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 size={16} /> Nome Fantasia
                  </label>
                  <input 
                    name="name" 
                    required 
                    defaultValue={selectedCompany?.name}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">CNPJ</label>
                  <input 
                    name="cnpj" 
                    required 
                    defaultValue={selectedCompany?.cnpj}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={16} /> Endereço Completo
                  </label>
                  <input 
                    name="address" 
                    required 
                    defaultValue={selectedCompany?.address}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone size={16} /> Telefone
                  </label>
                  <input 
                    name="phone" 
                    required 
                    defaultValue={selectedCompany?.phone}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} /> Nome do Contato
                  </label>
                  <input 
                    name="contactName" 
                    required 
                    defaultValue={selectedCompany?.contactName}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">WhatsApp do Contato</label>
                  <input 
                    name="contactPhone" 
                    required 
                    defaultValue={selectedCompany?.contactPhone}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={16} /> Email do Contato
                  </label>
                  <input 
                    name="contactEmail" 
                    type="email" 
                    required 
                    defaultValue={selectedCompany?.contactEmail}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Cidade</label>
                  <input 
                    name="city" 
                    required 
                    defaultValue={selectedCompany?.city}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">UF</label>
                  <input 
                    name="uf" 
                    required 
                    maxLength={2}
                    defaultValue={selectedCompany?.uf}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none uppercase"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-brand text-white font-medium rounded-lg hover:bg-brand-hover transition-colors"
                >
                  {selectedCompany ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ficha da Construtora (Visualização de Detalhes) */}
      {isDetailOpen && companyToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-brand/5 to-transparent border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ficha da Construtora</h2>
                  <p className="text-xs text-gray-500">Detalhes completos da parceira</p>
                </div>
              </div>
              <button 
                onClick={handleCloseDetail} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informações Principais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">Razão Social / Fantasia</span>
                    <span className="font-medium text-gray-950">{companyToView.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">CNPJ</span>
                    <span className="font-medium text-gray-950">{companyToView.cnpj || 'Não informado'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-500 block">Endereço</span>
                    <span className="font-medium text-gray-950">{companyToView.address || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Cidade / UF</span>
                    <span className="font-medium text-gray-950">{companyToView.city} - {companyToView.uf}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Telefone Comercial</span>
                    <span className="font-medium text-gray-950">{companyToView.phone || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Informações de Contato */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ponto de Contato</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">Nome do Contato</span>
                    <span className="font-medium text-gray-950">{companyToView.contactName || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">WhatsApp / Telefone</span>
                    <span className="font-medium text-gray-950">{companyToView.contactPhone || 'Não informado'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-500 block">E-mail</span>
                    <span className="font-medium text-gray-950">{companyToView.contactEmail || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCloseDetail();
                  handleOpenModal(companyToView);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand text-white font-medium rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Editar Construtora
              </button>
              <button
                type="button"
                onClick={() => handleDelete(companyToView.id, companyToView.name)}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Excluir Construtora
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
    </div>
  );
};

export default Companies;
