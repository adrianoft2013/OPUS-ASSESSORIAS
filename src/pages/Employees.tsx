import React, { useState, useEffect } from 'react';
import { Search, Plus, X, User, HardHat, FileText, CheckCircle2, AlertCircle, Calendar, Camera, Trash2, Download, Building2, Edit2, Briefcase, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from '../AppContext';
import { Employee, EmployeeDocument } from '../types';
import { cn } from '../lib/utils';

const DOCUMENT_TYPES = ['EPI', 'ASO', 'NR06', 'NR10', 'NR12', 'NR18', 'NR35'];
const ALL_DOCUMENT_TYPES = [...DOCUMENT_TYPES, 'Ordem de Serviço', 'Ficha de Registro', 'Contrato de Trabalho'];

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
  const { employees, works, companies, addEmployee, updateEmployee, deleteEmployee, companyData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return localStorage.getItem('draft_employee_open') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem('draft_employee_selected');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // Form State
  const [formDocuments, setFormDocuments] = useState<EmployeeDocument[]>(() => {
    try {
      const saved = localStorage.getItem('draft_employee_documents');
      return saved ? JSON.parse(saved) : ALL_DOCUMENT_TYPES.map(type => ({ type, dueDate: '', fileName: '', fileUrl: '' }));
    } catch {
      return ALL_DOCUMENT_TYPES.map(type => ({ type, dueDate: '', fileName: '', fileUrl: '' }));
    }
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    try {
      return localStorage.getItem('draft_employee_company_id') || '';
    } catch {
      return '';
    }
  });

  const [formValues, setFormValues] = useState(() => {
    try {
      const saved = localStorage.getItem('draft_employee_values');
      return saved ? JSON.parse(saved) : {
        name: '',
        cpf: '',
        role: '',
        workId: '',
        status: 'active',
        contractorName: '',
        serviceOrder: 'Conforme',
        registrationRecord: 'Conforme',
        employmentContract: 'Conforme'
      };
    } catch {
      return {
        name: '',
        cpf: '',
        role: '',
        workId: '',
        status: 'active',
        contractorName: '',
        serviceOrder: 'Conforme',
        registrationRecord: 'Conforme',
        employmentContract: 'Conforme'
      };
    }
  });

  const handleDelete = (id: string, name: string) => {
    setEmployeeToDelete({ id, name });
  };

  // Synchronize modal state, selected employee and form state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('draft_employee_open', String(isModalOpen));
    } catch (e) {
      console.error(e);
    }
  }, [isModalOpen]);

  useEffect(() => {
    try {
      if (selectedEmployee) {
        localStorage.setItem('draft_employee_selected', JSON.stringify(selectedEmployee));
      } else {
        localStorage.removeItem('draft_employee_selected');
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_employee_values', JSON.stringify(formValues));
    } catch (e) {
      console.error(e);
    }
  }, [formValues]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_employee_company_id', selectedCompanyId);
    } catch (e) {
      console.error(e);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_employee_documents', JSON.stringify(formDocuments));
    } catch (e) {
      console.error(e);
    }
  }, [formDocuments]);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cpf.includes(searchTerm) ||
    e.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.contractorName && e.contractorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setSelectedCompanyId(employee.companyId || '');
      // Ensure all required types exist in the form state
      const existingDocs = employee.documents || [];
      const completeDocs = ALL_DOCUMENT_TYPES.map(type => {
        const found = existingDocs.find(d => d.type === type);
        return found || { type, dueDate: '', fileName: '', fileUrl: '' };
      });
      setFormDocuments(completeDocs);
      setFormValues({
        name: employee.name || '',
        cpf: employee.cpf || '',
        role: employee.role || '',
        workId: employee.workId || '',
        status: employee.status || 'active',
        contractorName: employee.contractorName || '',
        serviceOrder: employee.serviceOrder || 'Conforme',
        registrationRecord: employee.registrationRecord || 'Conforme',
        employmentContract: employee.employmentContract || 'Conforme'
      });
    } else {
      setSelectedEmployee(null);
      setSelectedCompanyId('');
      setFormDocuments(ALL_DOCUMENT_TYPES.map(type => ({ type, dueDate: '', fileName: '', fileUrl: '' })));
      // Reset form values ONLY if there is no draft
      const saved = localStorage.getItem('draft_employee_values');
      if (!saved) {
        setFormValues({
          name: '',
          cpf: '',
          role: '',
          workId: '',
          status: 'active',
          contractorName: '',
          serviceOrder: 'Conforme',
          registrationRecord: 'Conforme',
          employmentContract: 'Conforme'
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setSelectedCompanyId('');
    setFormDocuments(ALL_DOCUMENT_TYPES.map(type => ({ type, dueDate: '', fileName: '', fileUrl: '' })));
    setFormValues({
      name: '',
      cpf: '',
      role: '',
      workId: '',
      status: 'active',
      contractorName: '',
      serviceOrder: 'Conforme',
      registrationRecord: 'Conforme',
      employmentContract: 'Conforme'
    });
    try {
      localStorage.removeItem('draft_employee_open');
      localStorage.removeItem('draft_employee_selected');
      localStorage.removeItem('draft_employee_values');
      localStorage.removeItem('draft_employee_company_id');
      localStorage.removeItem('draft_employee_documents');
    } catch (e) {
      console.error(e);
    }
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
    const companyId = selectedCompanyId;
    const workId = formValues.workId;
    
    const company = companies.find(c => c.id === companyId);
    const work = works.find(w => w.id === workId);
    const contractorName = formValues.contractorName;

    const data = {
      name: formValues.name,
      cpf: formValues.cpf,
      role: formValues.role,
      companyId: companyId,
      companyName: company?.name || 'N/A',
      workId: workId,
      workName: work?.name || 'N/A',
      status: formValues.status as 'active' | 'inactive',
      isContractor: !!contractorName,
      contractorName: contractorName || '',
      serviceOrder: formValues.serviceOrder,
      registrationRecord: formValues.registrationRecord,
      employmentContract: formValues.employmentContract,
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

  const serviceOrderDoc = formDocuments.find(d => d.type === 'Ordem de Serviço') || { type: 'Ordem de Serviço', dueDate: '', fileName: '', fileUrl: '' };
  const registrationRecordDoc = formDocuments.find(d => d.type === 'Ficha de Registro') || { type: 'Ficha de Registro', dueDate: '', fileName: '', fileUrl: '' };
  const employmentContractDoc = formDocuments.find(d => d.type === 'Contrato de Trabalho') || { type: 'Contrato de Trabalho', dueDate: '', fileName: '', fileUrl: '' };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const getDocStatusText = (dueDate: string) => {
      if (!dueDate) return '---';
      const today = new Date();
      const expiration = new Date(dueDate);
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dateStr = expiration.toLocaleDateString('pt-BR');
      if (diffDays < 0) return `${dateStr} (Vencido)`;
      if (diffDays <= 30) return `${dateStr} (A vencer)`;
      return dateStr;
    };

    // Draw Blue Top Bar
    doc.setFillColor(37, 99, 235);
    doc.rect(14, 8, 269, 3, 'F');

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text('RELATÓRIO DE FUNCIONÁRIOS', 14, 18);

    // Subtitle / Meta
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(108, 117, 125);
    
    let metaText = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
    if (companyData?.name) {
      metaText += ` | Empresa: ${companyData.name}`;
    }
    doc.text(metaText, 14, 24);

    // Filter status text
    if (searchTerm) {
      doc.text(`Filtro de busca: "${searchTerm}"`, 14, 29);
    }

    const startY = searchTerm ? 34 : 29;

    autoTable(doc, {
      startY: startY,
      head: [[
        'Funcionário',
        'Obra / Construtora',
        'Terceirizada',
        'EPI',
        'ASO',
        'NR06',
        'NR10',
        'NR12',
        'NR18',
        'NR35',
        'O.S.',
        'Reg.',
        'Contr.'
      ]],
      body: filteredEmployees.map(emp => {
        return [
          `${emp.name}\nCPF: ${emp.cpf}\n${emp.role}`,
          `${emp.workName}\n${emp.companyName}`,
          emp.contractorName || 'Próprio',
          getDocStatusText(emp.documents?.find(d => d.type === 'EPI')?.dueDate || ''),
          getDocStatusText(emp.documents?.find(d => d.type === 'ASO')?.dueDate || ''),
          getDocStatusText(emp.documents?.find(d => d.type === 'NR06')?.dueDate || ''),
          getDocStatusText(emp.documents?.find(d => d.type === 'NR10')?.dueDate || ''),
          getDocStatusText(emp.documents?.find(d => d.type === 'NR12')?.dueDate || ''),
          getDocStatusText(emp.documents?.find(d => d.type === 'NR18')?.dueDate || ''),
          getDocStatusText(emp.documents?.find(d => d.type === 'NR35')?.dueDate || ''),
          emp.serviceOrder || '---',
          emp.registrationRecord || '---',
          emp.employmentContract || '---'
        ];
      }),
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [51, 65, 85],
        valign: 'middle'
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', minCellWidth: 28 },
        1: { halign: 'left', minCellWidth: 28 },
        2: { halign: 'center', minCellWidth: 18 },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' },
        9: { halign: 'center' },
        10: { halign: 'center' },
        11: { halign: 'center' },
        12: { halign: 'center' }
      },
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const text = data.cell.text[0] || '';
          if (text.includes('(Vencido)')) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (text.includes('(A vencer)')) {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'Não Conforme') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'Conforme') {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 1.5
      }
    });

    doc.save(`Relatorio_Funcionarios_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      {!isModalOpen ? (
        <>
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
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou obra..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
            title="Exportar Relatório em formato PDF (Paisagem)"
          >
            <Download size={18} className="text-gray-500" />
            Exportar Relatórios
          </button>
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
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-center">Ordem de Serviço</th>
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-center">Ficha de Registro</th>
                <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-center">Contrato de Trabalho</th>
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
                    {/* Ordem de Serviço */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {employee.serviceOrder ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            employee.serviceOrder === 'Conforme'
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {employee.serviceOrder}
                          </span>
                        ) : (
                          <span className="text-gray-400">---</span>
                        )}
                        {(() => {
                          const doc = employee.documents?.find(d => d.type === 'Ordem de Serviço');
                          return doc?.fileUrl ? (
                            <a 
                              href={doc.fileUrl} 
                              download={doc.fileName}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[9px] text-brand hover:underline"
                              title={doc.fileName}
                            >
                              <Download size={10} /> Baixar
                            </a>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    {/* Ficha de Registro */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {employee.registrationRecord ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            employee.registrationRecord === 'Conforme'
                              ? "bg-green-50 text-green-700 border-green-200"
                              : employee.registrationRecord === 'N/A'
                                ? "bg-gray-50 text-gray-500 border-gray-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {employee.registrationRecord}
                          </span>
                        ) : (
                          <span className="text-gray-400">---</span>
                        )}
                        {(() => {
                          const doc = employee.documents?.find(d => d.type === 'Ficha de Registro');
                          return doc?.fileUrl ? (
                            <a 
                              href={doc.fileUrl} 
                              download={doc.fileName}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[9px] text-brand hover:underline"
                              title={doc.fileName}
                            >
                              <Download size={10} /> Baixar
                            </a>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    {/* Contrato de Trabalho */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {employee.employmentContract ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            employee.employmentContract === 'Conforme'
                              ? "bg-green-50 text-green-700 border-green-200"
                              : employee.employmentContract === 'N/A'
                                ? "bg-gray-50 text-gray-500 border-gray-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {employee.employmentContract}
                          </span>
                        ) : (
                          <span className="text-gray-400">---</span>
                        )}
                        {(() => {
                          const doc = employee.documents?.find(d => d.type === 'Contrato de Trabalho');
                          return doc?.fileUrl ? (
                            <a 
                              href={doc.fileUrl} 
                              download={doc.fileName}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[9px] text-brand hover:underline"
                              title={doc.fileName}
                            >
                              <Download size={10} /> Baixar
                            </a>
                          ) : null;
                        })()}
                      </div>
                    </td>
                     <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleOpenModal(employee)}
                          className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.id, employee.name)}
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
                  <td colSpan={DOCUMENT_TYPES.length + 7} className="px-6 py-12 text-center text-gray-400">
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedEmployee ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
              </h1>
              <p className="text-gray-500">Insira os dados do funcionário abaixo para prosseguir.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} /> Nome Completo
                  </label>
                  <input 
                    name="name" 
                    required 
                    value={formValues.name}
                    onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">CPF</label>
                  <input 
                    name="cpf" 
                    required 
                    value={formValues.cpf}
                    onChange={(e) => setFormValues(prev => ({ ...prev, cpf: e.target.value }))}
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
                    value={formValues.role}
                    onChange={(e) => setFormValues(prev => ({ ...prev, role: e.target.value }))}
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
                    value={formValues.workId}
                    onChange={(e) => setFormValues(prev => ({ ...prev, workId: e.target.value }))}
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
                    value={formValues.status}
                    onChange={(e) => setFormValues(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Briefcase size={16} /> Empresa Terceirizada (Opcional)
                    </label>
                    <input 
                      name="contractorName" 
                      value={formValues.contractorName}
                      onChange={(e) => setFormValues(prev => ({ ...prev, contractorName: e.target.value }))}
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
                  {formDocuments.filter(doc => DOCUMENT_TYPES.includes(doc.type)).map((doc) => (
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

              {/* Ordem de Serviço e Ficha de Registro abaixo de Documentação Obrigatória */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 gap-4">
                  
                  {/* Ordem de Serviço */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={16} /> Ordem de Serviço
                      </label>
                      <select 
                        name="serviceOrder" 
                        value={formValues.serviceOrder}
                        onChange={(e) => setFormValues(prev => ({ ...prev, serviceOrder: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white text-sm font-medium text-gray-800"
                      >
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                      </select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arquivo Ordem de Serviço (PDF/IMG)</label>
                      <div className="flex items-center gap-2">
                        {serviceOrderDoc.fileName ? (
                          <div className="flex-1 flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg">
                            <span className="text-sm text-gray-600 truncate max-w-[150px]">{serviceOrderDoc.fileName}</span>
                            <div className="flex items-center gap-1">
                              {serviceOrderDoc.fileUrl && (
                                <a 
                                  href={serviceOrderDoc.fileUrl} 
                                  download={serviceOrderDoc.fileName}
                                  className="p-1 text-gray-400 hover:text-gray-900"
                                >
                                  <Download size={16} />
                                </a>
                              )}
                              <button 
                                type="button"
                                onClick={() => handleRemoveFile('Ordem de Serviço')}
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
                              onChange={(e) => handleFileUpload('Ordem de Serviço', e)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ficha de Registro */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={16} /> Ficha de Registro
                      </label>
                      <select 
                        name="registrationRecord" 
                        value={formValues.registrationRecord}
                        onChange={(e) => setFormValues(prev => ({ ...prev, registrationRecord: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white text-sm font-medium text-gray-800"
                      >
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arquivo Ficha de Registro (PDF/IMG)</label>
                      <div className="flex items-center gap-2">
                        {registrationRecordDoc.fileName ? (
                          <div className="flex-1 flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg">
                            <span className="text-sm text-gray-600 truncate max-w-[150px]">{registrationRecordDoc.fileName}</span>
                            <div className="flex items-center gap-1">
                              {registrationRecordDoc.fileUrl && (
                                <a 
                                  href={registrationRecordDoc.fileUrl} 
                                  download={registrationRecordDoc.fileName}
                                  className="p-1 text-gray-400 hover:text-gray-900"
                                >
                                  <Download size={16} />
                                </a>
                              )}
                              <button 
                                type="button"
                                onClick={() => handleRemoveFile('Ficha de Registro')}
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
                              onChange={(e) => handleFileUpload('Ficha de Registro', e)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contrato de Trabalho */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={16} /> Contrato de Trabalho
                      </label>
                      <select 
                        name="employmentContract" 
                        value={formValues.employmentContract}
                        onChange={(e) => setFormValues(prev => ({ ...prev, employmentContract: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none bg-white text-sm font-medium text-gray-800"
                      >
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Arquivo Contrato de Trabalho (PDF/IMG)</label>
                      <div className="flex items-center gap-2">
                        {employmentContractDoc.fileName ? (
                          <div className="flex-1 flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg">
                            <span className="text-sm text-gray-600 truncate max-w-[150px]">{employmentContractDoc.fileName}</span>
                            <div className="flex items-center gap-1">
                              {employmentContractDoc.fileUrl && (
                                <a 
                                  href={employmentContractDoc.fileUrl} 
                                  download={employmentContractDoc.fileName}
                                  className="p-1 text-gray-400 hover:text-gray-900"
                                >
                                  <Download size={16} />
                                </a>
                              )}
                              <button 
                                type="button"
                                onClick={() => handleRemoveFile('Contrato de Trabalho')}
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
                              onChange={(e) => handleFileUpload('Contrato de Trabalho', e)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

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

      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Tem certeza que deseja excluir o funcionário <strong className="text-gray-900">{employeeToDelete.name}</strong>? Esta ação é irreversível e removerá todos os dados do funcionário do sistema.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteEmployee(employeeToDelete.id);
                  setEmployeeToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
