import React, { useState, useEffect } from 'react';
import { Search, Plus, X, User, HardHat, FileText, CheckCircle2, AlertCircle, Calendar, Camera, Trash2, Download, Building2, Edit2, Briefcase } from 'lucide-react';
import { useApp } from '../AppContext';
import { Employee, EmployeeDocument } from '../types';
import { cn } from '../lib/utils';

const DOCUMENT_TYPES = ['EPI', 'ASO', 'NR06', 'NR10', 'NR12', 'NR18', 'NR35'];

const getStatusColor = (dueDate: string) => {
  if (!dueDate) return 'text-gray-400';
  const today = new Date();
  const expiration = new Date(dueDate);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-red-600 font-bold';
  if (diffDays <= 30) return 'text-yellow-600 font-bold';
  return 'text-green-600 font-bold';
};

const Employees: React.FC = () => {
  const { employees, works, companies, addEmployee, updateEmployee } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Form State
  const [formDocuments, setFormDocuments] = useState<EmployeeDocument[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  useEffect(() => {
    if (selectedEmployee) {
      setSelectedCompanyId(selectedEmployee.companyId || '');
      // Ensure all required types exist in the form state
      const existingDocs = selectedEmployee.documents || [];
      const completeDocs = DOCUMENT_TYPES.map(type => {
        const found = existingDocs.find(d => d.type === type);
        return found || { type, dueDate: '', fileName: '', fileUrl: '' };
      });
      setFormDocuments(completeDocs);
    } else {
      setFormDocuments(DOCUMENT_TYPES.map(type => ({ type, dueDate: '', fileName: '', fileUrl: '' })));
    }
  }, [selectedEmployee, isModalOpen]);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cpf.includes(searchTerm) ||
    e.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.contractorName && e.contractorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (employee?: Employee) => {
    setSelectedEmployee(employee || null);
    setSelectedCompanyId(employee?.companyId || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setSelectedCompanyId('');
  };

  const handleDocumentChange = (type: string, field: keyof EmployeeDocument, value: string) => {
    setFormDocuments(prev => prev.map(doc => 
      doc.type === type ? { ...doc, [field]: value } : doc
    ));
  };

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormDocuments(prev => prev.map(doc => 
          doc.type === type ? { ...doc, fileUrl: reader.result as string, fileName: file.name } : doc
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (type: string) => {
    setFormDocuments(prev => prev.map(doc => 
      doc.type === type ? { ...doc, fileUrl: '', fileName: '' } : doc
    ));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyId = formData.get('companyId') as string;
    const workId = formData.get('workId') as string;
    
    const company = companies.find(c => c.id === companyId);
    const work = works.find(w => w.id === workId);
    const contractorName = formData.get('contractorName') as string;

    const data = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      role: formData.get('role') as string,
      companyId: companyId,
      companyName: company?.name || 'N/A',
      workId: workId,
      workName: work?.name || 'N/A',
      status: formData.get('status') as 'active' | 'inactive',
      isContractor: !!contractorName,
      contractorName: contractorName || '',
      serviceOrder: (formData.get('serviceOrder') as string) || '',
      registrationRecord: (formData.get('registrationRecord') as string) || '',
      documents: formDocuments,
    };

    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, data);
      } else {
        await addEmployee(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar o funcionário. Verifique sua conexão e as configurações do Supabase.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500">Documentação e alocação de pessoal.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
        >
          <Plus size={20} />
          Novo Funcionário
        </button>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou obra..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Funcionário</th>
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Obra / Construtora</th>
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider">Terceirizada</th>
                {DOCUMENT_TYPES.map(type => (
                  <th key={type} className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-center">{type}</th>
                ))}
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(employee)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{employee.name}</div>
                      <div className="text-[10px] text-gray-400">{employee.role}</div>
                      {(employee.serviceOrder || employee.registrationRecord) && (
                        <div className="text-[10px] text-brand font-medium mt-1 flex items-center gap-2">
                          {employee.registrationRecord && <span>Reg: {employee.registrationRecord}</span>}
                          {employee.serviceOrder && <span>OS: {employee.serviceOrder}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="truncate max-w-[150px] font-medium">{employee.workName}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{employee.companyName}</div>
                    </td>
                    <td className="px-4 py-3">
                      {employee.contractorName ? (
                        <span className="text-gray-900 font-medium truncate max-w-[120px] block">
                          {employee.contractorName}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Próprio</span>
                      )}
                    </td>
                    {DOCUMENT_TYPES.map(type => {
                      const doc = employee.documents?.find(d => d.type === type);
                      const isNAType = ['ASO', 'EPI', 'NR06', 'NR10', 'NR12', 'NR18', 'NR35'].includes(type.toUpperCase());
                      return (
                        <td key={type} className="px-4 py-3 text-center">
                          <div className={cn("whitespace-nowrap", getStatusColor(doc?.dueDate || ''))}>
                            {doc?.dueDate ? new Date(doc.dueDate).toLocaleDateString('pt-BR') : (isNAType ? 'N/A' : '---')}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <button className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={DOCUMENT_TYPES.length + 4} className="px-6 py-12 text-center text-gray-400">
                    Nenhum funcionário encontrado.
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
                {selectedEmployee ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} /> Nome Completo
                  </label>
                  <input 
                    name="name" 
                    required 
                    defaultValue={selectedEmployee?.name}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">CPF</label>
                  <input 
                    name="cpf" 
                    required 
                    defaultValue={selectedEmployee?.cpf}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} /> Função / Cargo
                  </label>
                  <input 
                    name="role" 
                    required 
                    defaultValue={selectedEmployee?.role}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 size={16} /> Construtora
                  </label>
                  <select 
                    name="companyId" 
                    required 
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white"
                  >
                    <option value="">Selecione a construtora</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <HardHat size={16} /> Obra Alocada
                  </label>
                  <select 
                    name="workId" 
                    required 
                    defaultValue={selectedEmployee?.workId}
                    disabled={!selectedCompanyId}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Selecione a obra</option>
                    {works
                      .filter(w => w.companyId === selectedCompanyId)
                      .map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <select 
                    name="status" 
                    required 
                    defaultValue={selectedEmployee?.status || 'active'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} /> Ordem de Serviço
                  </label>
                  <input 
                    name="serviceOrder" 
                    defaultValue={selectedEmployee?.serviceOrder}
                    placeholder="Ex: OS-001 ou instruções"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} /> Ficha de Registro
                  </label>
                  <input 
                    name="registrationRecord" 
                    defaultValue={selectedEmployee?.registrationRecord}
                    placeholder="Ex: Nº de Registro / Matrícula"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Briefcase size={16} /> Empresa Terceirizada (Opcional)
                    </label>
                    <input 
                      name="contractorName" 
                      defaultValue={selectedEmployee?.contractorName}
                      placeholder="Deixe em branco se for funcionário próprio"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} /> Documentação Obrigatória
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {formDocuments.map((doc) => (
                    <div key={doc.type} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{doc.type}</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                              type="date"
                              value={doc.dueDate}
                              onChange={(e) => handleDocumentChange(doc.type, 'dueDate', e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arquivo (PDF/IMG)</label>
                        <div className="flex items-center gap-2">
                          {doc.fileName ? (
                            <div className="flex-1 flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg">
                              <span className="text-sm text-gray-600 truncate max-w-[150px]">{doc.fileName}</span>
                              <div className="flex items-center gap-1">
                                {doc.fileUrl && (
                                  <a 
                                    href={doc.fileUrl} 
                                    download={doc.fileName}
                                    className="p-1 text-gray-400 hover:text-gray-900"
                                  >
                                    <Download size={16} />
                                  </a>
                                )}
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveFile(doc.type)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer text-sm font-medium text-gray-500">
                              <Camera size={16} />
                              Anexar Documento
                              <input 
                                type="file" 
                                accept="image/*,application/pdf" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(doc.type, e)} 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {selectedEmployee ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
