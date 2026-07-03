import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  X, 
  ClipboardCheck, 
  Building2, 
  HardHat, 
  Calendar, 
  Camera, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Download,
  ArrowLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useApp } from '../AppContext';
import { Inspection, Evidence, Work } from '../types';
import { cn } from '../lib/utils';

const cleanForLocalStorage = <T,>(obj: T): T => {
  if (typeof obj === 'string') {
    if (obj.length > 1000 && obj.startsWith('data:')) {
      return '' as unknown as T;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return obj;
    let changed = false;
    const result = obj.map(item => {
      const cleaned = cleanForLocalStorage(item);
      if (cleaned !== item) changed = true;
      return cleaned;
    });
    return changed ? result as unknown as T : obj;
  }
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    let changed = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (typeof val === 'string') {
          if (val.length > 1000 && val.startsWith('data:')) {
            result[key] = '';
            changed = true;
          } else {
            result[key] = val;
          }
        } else if (val === null || typeof val === 'number' || typeof val === 'boolean') {
          result[key] = val;
        } else {
          const cleaned = cleanForLocalStorage(val);
          result[key] = cleaned;
          if (cleaned !== val) {
            changed = true;
          }
        }
      }
    }
    return changed ? result as T : obj;
  }
  return obj;
};

const safeLocalStorageSet = (key: string, value: any) => {
  try {
    const cleanedValue = cleanForLocalStorage(value);
    const serialized = typeof cleanedValue === 'string' ? cleanedValue : JSON.stringify(cleanedValue);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Could not save key "${key}" to localStorage:`, error);
  }
};

const Inspections: React.FC = () => {
  const { inspections, works, companies, addInspection, companyData } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return localStorage.getItem('draft_inspection_open') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(() => {
    try {
      const saved = localStorage.getItem('draft_inspection_selected');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Reset view to list when user clicks Vistorias in sidebar
  useEffect(() => {
    setIsModalOpen(false);
    setSelectedInspection(null);
  }, [location.key]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    try {
      return localStorage.getItem('draft_inspection_company_id') || '';
    } catch {
      return '';
    }
  });

  const [selectedWorkId, setSelectedWorkId] = useState(() => {
    try {
      return localStorage.getItem('draft_inspection_work_id') || '';
    } catch {
      return '';
    }
  });

  const [inspectionDate, setInspectionDate] = useState(() => {
    try {
      return localStorage.getItem('draft_inspection_date') || new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });

  const [status, setStatus] = useState<'conformity' | 'non-conformity'>(() => {
    try {
      return (localStorage.getItem('draft_inspection_status') as 'conformity' | 'non-conformity') || 'conformity';
    } catch {
      return 'conformity';
    }
  });

  const [evidences, setEvidences] = useState<Evidence[]>(() => {
    try {
      const saved = localStorage.getItem('draft_inspection_evidences');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  // Synchronize draft inspection states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('draft_inspection_open', String(isModalOpen));
    } catch (e) {
      console.error(e);
    }
  }, [isModalOpen]);

  useEffect(() => {
    try {
      if (selectedInspection) {
        localStorage.setItem('draft_inspection_selected', JSON.stringify(selectedInspection));
      } else {
        localStorage.removeItem('draft_inspection_selected');
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedInspection]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_inspection_company_id', selectedCompanyId);
    } catch (e) {
      console.error(e);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_inspection_work_id', selectedWorkId);
    } catch (e) {
      console.error(e);
    }
  }, [selectedWorkId]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_inspection_date', inspectionDate);
    } catch (e) {
      console.error(e);
    }
  }, [inspectionDate]);

  useEffect(() => {
    try {
      localStorage.setItem('draft_inspection_status', status);
    } catch (e) {
      console.error(e);
    }
  }, [status]);

  useEffect(() => {
    const handler = setTimeout(() => {
      safeLocalStorageSet('draft_inspection_evidences', evidences);
    }, 500);
    return () => clearTimeout(handler);
  }, [evidences]);

  const filteredInspections = inspections.filter(i => 
    i.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (inspection?: Inspection) => {
    if (inspection) {
      setSelectedInspection(inspection);
      setSelectedCompanyId(inspection.companyId);
      setSelectedWorkId(inspection.workId);
      setInspectionDate(inspection.date);
      setStatus(inspection.status);
      setEvidences(inspection.evidences || []);
    } else {
      setSelectedInspection(null);
      // Keep draft values if they exist, otherwise initialize empty
      const saved = localStorage.getItem('draft_inspection_company_id');
      if (!saved) {
        setSelectedCompanyId('');
        setSelectedWorkId('');
        setInspectionDate(new Date().toISOString().split('T')[0]);
        setStatus('conformity');
        setEvidences([]);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInspection(null);
    setSelectedCompanyId('');
    setSelectedWorkId('');
    setInspectionDate(new Date().toISOString().split('T')[0]);
    setStatus('conformity');
    setEvidences([]);
    try {
      localStorage.removeItem('draft_inspection_open');
      localStorage.removeItem('draft_inspection_selected');
      localStorage.removeItem('draft_inspection_company_id');
      localStorage.removeItem('draft_inspection_work_id');
      localStorage.removeItem('draft_inspection_date');
      localStorage.removeItem('draft_inspection_status');
      localStorage.removeItem('draft_inspection_evidences');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddEvidence = () => {
    const newEvidence: Evidence = {
      id: crypto.randomUUID(),
      description: '',
    };
    setEvidences([...evidences, newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidences(evidences.filter(e => e.id !== id));
  };

  const handleEvidenceChange = (id: string, field: keyof Evidence, value: string) => {
    setEvidences(evidences.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidences(evidences.map(ev => 
          ev.id === id ? { ...ev, photoUrl: reader.result as string, fileName: file.name } : ev
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const work = works.find(w => w.id === selectedWorkId);
    if (!work) return;

    const data: Omit<Inspection, 'id'> = {
      workId: work.id,
      workName: work.name,
      companyId: work.companyId,
      companyName: work.companyName,
      date: inspectionDate,
      status,
      evidences,
      city: work.city,
      uf: work.uf,
    };

    try {
      await addInspection(data);
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      alert('Erro ao salvar a vistoria. Verifique sua conexão e as configurações do Supabase.');
    }
  };

  const generatePDF = async (inspection: Inspection) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    // Ensure the inspection we want to export is the one selected
    if (!selectedInspection || selectedInspection.id !== inspection.id) {
      setSelectedInspection(inspection);
    }
    
    // Wait for React to render the hidden content and for images to settle
    // We use a slightly longer timeout to ensure DOM stability
    setTimeout(async () => {
      const element = document.getElementById(`pdf-content-export`);
      
      if (!element) {
        console.error('PDF export element not found');
        setIsGeneratingPdf(false);
        return;
      }

      try {
        // Find all images in the element and wait for them to load
        const images = Array.from(element.getElementsByTagName('img'));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));

        // Capture the element
        const canvas = await html2canvas(element, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          imageTimeout: 15000, // 15s timeout for images
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const margin = 10; // 10mm margin
        const contentWidth = pdfWidth - (2 * margin);
        const contentHeight = (imgProps.height * contentWidth) / imgProps.width;
        
        let heightLeft = contentHeight;
        let position = margin;

        // Add first page
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - (2 * margin));

        // Add subsequent pages if content is longer than one page
        while (heightLeft > 0) {
          position = heightLeft - contentHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
          heightLeft -= (pdfHeight - (2 * margin));
        }

        const fileName = `Relatorio_Vistoria_${inspection.workName.replace(/[^a-z0-9]/gi, '_')}_${inspection.date}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
      } finally {
        setIsGeneratingPdf(false);
        // If we weren't in the modal, clear the selection
        if (!isModalOpen) {
          setSelectedInspection(null);
        }
      }
    }, 800); // Increased timeout for better reliability
  };

  const InspectionReport = ({ inspection }: { inspection: Inspection }) => (
    <div className="bg-white space-y-8">
      {/* PDF Header */}
      <div className="flex justify-between items-start border-b-4 border-brand pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Relatório de Vistoria</h1>
          <p className="text-gray-500 font-bold text-lg">Controle de Qualidade e Segurança</p>
          <p className="text-gray-400 text-sm mt-1">Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
        {companyData.logoUrl && (
          <div className="h-20 w-40 flex items-center justify-end">
            <img src={companyData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-8 bg-gray-50 p-8 rounded-2xl border border-gray-100">
        <div className="space-y-1">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Obra / Empreendimento</p>
          <p className="text-xl font-bold text-gray-900">{inspection.workName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Construtora Responsável</p>
          <p className="text-xl font-bold text-gray-900">{inspection.companyName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Localização</p>
          <p className="text-xl font-bold text-gray-900">{inspection.city} - {inspection.uf}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Data da Vistoria</p>
          <p className="text-xl font-bold text-gray-900">{new Date(inspection.date).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Status da Inspeção</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "w-4 h-4 rounded-full",
              inspection.status === 'conformity' ? "bg-green-500" : "bg-red-500"
            )} />
            <p className={cn(
              "text-2xl font-black uppercase tracking-tight",
              inspection.status === 'conformity' ? "text-green-600" : "text-red-600"
            )}>
              {inspection.status === 'conformity' ? 'CONFORMIDADE' : 'NÃO CONFORMIDADE'}
            </p>
          </div>
        </div>
      </div>

      {/* Evidences */}
      <div className="space-y-8 pt-8">
        <h3 className="text-2xl font-black text-gray-900 border-l-8 border-brand pl-4 uppercase tracking-tight">Evidências e Observações</h3>
        <div className="space-y-12">
          {inspection.evidences.length > 0 ? (
            inspection.evidences.map((evidence, idx) => (
              <div key={evidence.id} className="break-inside-avoid space-y-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <span className="px-4 py-1 bg-brand text-white text-sm font-black rounded-lg uppercase tracking-wider">
                    Item de Verificação #{idx + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição Técnica</p>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {evidence.description || 'Nenhuma observação técnica registrada para este item.'}
                    </p>
                  </div>
                  {evidence.photoUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Registro Fotográfico</p>
                      <div className="rounded-2xl overflow-hidden border-4 border-gray-50 shadow-md">
                        <img 
                          src={evidence.photoUrl} 
                          alt={`Evidência ${idx + 1}`} 
                          className="w-full h-auto max-h-[500px] object-contain bg-gray-50"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Nenhuma evidência fotográfica ou textual foi registrada nesta vistoria.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Footer */}
      <div className="pt-12 mt-12 border-t border-gray-100 flex justify-between items-end text-gray-400 text-xs">
        <div>
          <p className="font-bold uppercase tracking-widest mb-1">{companyData.name}</p>
          <p>Sistema de Gestão de Obras - SYS - Sistemas Web</p>
        </div>
        <div className="text-right">
          <p>Assinatura do Responsável</p>
          <div className="w-48 h-px bg-gray-200 mt-8" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {!isModalOpen ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vistorias</h1>
          <p className="text-gray-500">Relatórios de conformidade e evidências.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
        >
          <Plus size={20} />
          Nova Vistoria
        </button>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por obra ou construtora..." 
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
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Obra / Construtora</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Cidade / UF</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Data</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInspections.length > 0 ? (
                filteredInspections.map((inspection) => (
                  <tr 
                    key={inspection.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(inspection)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{inspection.workName}</div>
                      <div className="text-xs text-gray-400">{inspection.companyName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {inspection.city} - {inspection.uf}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(inspection.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                        inspection.status === 'conformity' 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      )}>
                        {inspection.status === 'conformity' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {inspection.status === 'conformity' ? 'Conformidade' : 'Não Conformidade'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma vistoria encontrada.
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
                {selectedInspection ? 'Detalhes da Vistoria' : 'Nova Vistoria'}
              </h1>
              <p className="text-gray-500 font-medium">
                {selectedInspection ? 'Relatório de vistoria e evidências.' : 'Insira os dados da nova vistoria abaixo.'}
              </p>
            </div>
            
            {selectedInspection && (
              <button 
                onClick={() => generatePDF(selectedInspection)}
                disabled={isGeneratingPdf}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 text-sm shadow-md"
              >
                <Download size={16} />
                {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {selectedInspection ? (
              <div className="p-6 md:p-8">
                <InspectionReport inspection={selectedInspection} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 size={16} /> Construtora
                    </label>
                    <select 
                      required 
                      value={selectedCompanyId}
                      onChange={(e) => {
                        setSelectedCompanyId(e.target.value);
                        setSelectedWorkId(''); // Reset work when company changes
                      }}
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
                      <HardHat size={16} /> Obra
                    </label>
                    <select 
                      required 
                      value={selectedWorkId}
                      onChange={(e) => setSelectedWorkId(e.target.value)}
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
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar size={16} /> Data da Vistoria
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ClipboardCheck size={16} /> Status Geral
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus('conformity')}
                        className={cn(
                          "flex-1 py-2 rounded-lg font-medium border transition-all",
                          status === 'conformity' 
                            ? "bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100" 
                            : "bg-white border-gray-200 text-gray-500"
                        )}
                      >
                        Conformidade
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('non-conformity')}
                        className={cn(
                          "flex-1 py-2 rounded-lg font-medium border transition-all",
                          status === 'non-conformity' 
                            ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100" 
                            : "bg-white border-gray-200 text-gray-500"
                        )}
                      >
                        Não Conformidade
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={18} /> Evidências e Fotos
                    </h3>
                    <button 
                      type="button"
                      onClick={handleAddEvidence}
                      className="text-sm font-bold text-gray-900 hover:underline flex items-center gap-1"
                    >
                      <Plus size={16} /> Adicionar Evidência
                    </button>
                  </div>

                  <div className="space-y-6">
                    {evidences.map((evidence, index) => (
                      <div key={evidence.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                        <button 
                          type="button"
                          onClick={() => handleRemoveEvidence(evidence.id)}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Descrição da Evidência #{index + 1}</label>
                            <textarea 
                              rows={4}
                              placeholder="Descreva o que foi observado..."
                              value={evidence.description}
                              onChange={(e) => handleEvidenceChange(evidence.id, 'description', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none resize-none bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Foto da Evidência</label>
                            {evidence.photoUrl ? (
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group/photo">
                                <img src={evidence.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                  <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm">
                                    Trocar Foto
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(evidence.id, e)} />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-100 transition-all cursor-pointer">
                                <Camera className="text-gray-400 mb-2" size={32} />
                                <span className="text-sm font-medium text-gray-500">Clique para anexar foto</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(evidence.id, e)} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {evidences.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                        <p className="text-gray-400">Nenhuma evidência adicionada ainda.</p>
                        <button 
                          type="button"
                          onClick={handleAddEvidence}
                          className="mt-2 text-gray-900 font-bold hover:underline"
                        >
                          Adicionar a primeira evidência
                        </button>
                      </div>
                    )}
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
                    Salvar Vistoria
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Hidden PDF Content for generation */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        {isGeneratingPdf && selectedInspection && (
          <div id="pdf-content-export" className="w-[1000px] p-12 bg-white">
            <InspectionReport inspection={selectedInspection} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspections;
