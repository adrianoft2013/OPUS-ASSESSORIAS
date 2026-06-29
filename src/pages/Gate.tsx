import React, { useState, useMemo } from 'react';
import { Search, Building2, HardHat, Calendar, Filter, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS_OF_WEEK = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];

const Gate: React.FC = () => {
  const { employees, works, companies, companyData } = useApp();
  
  // Filters
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Generate date range
  const dateRange = useMemo(() => {
    const dates = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    let current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    // Limit to 14 days to prevent UI explosion
    let count = 0;
    while (current <= end && count < 14) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
      count++;
    }
    return dates;
  }, [startDate, endDate]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchCompany = !selectedCompanyId || e.companyId === selectedCompanyId;
      const matchWork = !selectedWorkId || e.workId === selectedWorkId;
      return matchCompany && matchWork;
    });
  }, [employees, selectedCompanyId, selectedWorkId]);

  // Group by Contractor Name
  const groupedEmployees = useMemo(() => {
    const groups: { [key: string]: typeof employees } = {};
    filteredEmployees.forEach(e => {
      const key = e.contractorName || 'PRÓPRIO';
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    
    // Sort keys: PRÓPRIO first, then alphabetically
    return Object.keys(groups).sort((a, b) => {
      if (a === 'PRÓPRIO') return -1;
      if (b === 'PRÓPRIO') return 1;
      return a.localeCompare(b);
    }).map(key => ({
      name: key,
      employees: groups[key]
    }));
  }, [filteredEmployees]);

  const hasExpiredDocs = (employee: any) => {
    const today = new Date().toISOString().split('T')[0];
    return employee.documents?.some((doc: any) => doc.dueDate && doc.dueDate < today);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const company = companies.find(c => c.id === selectedCompanyId);
    const work = works.find(w => w.id === selectedWorkId);

    // Header
    doc.setFontSize(16);
    doc.text('Relatório de Portaria', 14, 15);
    
    if (companyData.logoUrl) {
      try {
        // Position logo on the top right
        doc.addImage(companyData.logoUrl, 'JPEG', 250, 8, 30, 15);
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
      }
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Empresa: ${companyData.name}`, 14, 22);
    doc.text(`Construtora: ${company?.name || 'Todas'}`, 14, 27);
    doc.text(`Obra: ${work?.name || 'Todas'}`, 14, 32);
    doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`, 14, 37);

    const tableRows: any[] = [];
    const head: any[] = [
      [
        { content: '', colSpan: 2, styles: { fillColor: [243, 244, 246] } },
        ...dateRange.map(date => ({
          content: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          colSpan: 2,
          styles: { halign: 'center', fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold', fontSize: 9 }
        }))
      ],
      [
        { content: 'NOME FUNCIONÁRIO', styles: { halign: 'center', fillColor: [249, 250, 251], textColor: [55, 65, 81], fontStyle: 'bold', fontSize: 9 } },
        { content: 'FUNÇÃO', styles: { halign: 'center', fillColor: [249, 250, 251], textColor: [55, 65, 81], fontStyle: 'bold', fontSize: 9 } },
        ...dateRange.map(date => ({
          content: DAYS_OF_WEEK[date.getDay()],
          colSpan: 2,
          styles: { halign: 'center', fillColor: [249, 250, 251], textColor: [107, 114, 128], fontStyle: 'bold', fontSize: 9 }
        }))
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        ...dateRange.flatMap(() => [
          { content: 'ENTRADA', styles: { halign: 'center', fontSize: 7, textColor: [156, 163, 175], fontStyle: 'bold', fillColor: [255, 255, 255] } },
          { content: 'SAÍDA', styles: { halign: 'center', fontSize: 7, textColor: [156, 163, 175], fontStyle: 'bold', fillColor: [255, 255, 255] } }
        ])
      ]
    ];

    groupedEmployees.forEach(group => {
      // Group Header Row
      tableRows.push([
        { 
          content: group.name.toUpperCase(), 
          colSpan: 2 + (dateRange.length * 2),
          styles: { fillColor: [107, 114, 128], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' }
        }
      ]);

      group.employees.forEach(emp => {
        const expired = hasExpiredDocs(emp);
        tableRows.push([
          { 
            content: emp.name.toUpperCase(), 
            styles: { textColor: expired ? [220, 38, 38] : [17, 24, 39], fontStyle: 'bold', fontSize: 9, halign: 'center' } 
          },
          {
            content: emp.role.toUpperCase(),
            styles: { textColor: [75, 85, 99], fontSize: 8, halign: 'center' }
          },
          ...dateRange.flatMap(() => ['', ''])
        ]);
      });
    });

    autoTable(doc, {
      head: head,
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, lineColor: [229, 231, 235], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 40 }
      }
    });

    doc.save(`relatorio-portaria-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portaria</h1>
          <p className="text-gray-500">Relatório de frequência e controle de acesso.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
          <Filter size={20} className="text-brand" />
          Filtros de Pesquisa
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Construtora</label>
            <select 
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setSelectedWorkId('');
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none text-sm"
            >
              <option value="">Todas as Construtoras</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Obra</label>
            <select 
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              disabled={!selectedCompanyId}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none text-sm disabled:opacity-50"
            >
              <option value="">Todas as Obras</option>
              {works
                .filter(w => w.companyId === selectedCompanyId)
                .map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))
              }
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Data Inicial</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Data Final</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {/* Row 1: Dates */}
              <tr className="bg-gray-100 border-b border-gray-200">
                <th colSpan={2} className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase"></th>
                {dateRange.map((date, idx) => (
                  <th key={idx} colSpan={2} className="px-2 py-2 text-center border-l border-gray-200 text-xs font-bold text-gray-900">
                    {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </th>
                ))}
              </tr>
              {/* Row 2: Days of Week */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase min-w-[200px]">Nome Funcionário</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase min-w-[150px]">Função</th>
                {dateRange.map((date, idx) => (
                  <th key={idx} colSpan={2} className="px-2 py-1 text-center border-l border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    {DAYS_OF_WEEK[date.getDay()]}
                  </th>
                ))}
              </tr>
              {/* Row 3: Entry/Exit labels */}
              <tr className="bg-white border-b border-gray-200">
                <th className="px-4 py-1"></th>
                <th className="px-4 py-1"></th>
                {dateRange.map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th className="px-1 py-1 text-[9px] font-bold text-gray-400 uppercase border-l border-gray-100 text-center">Entrada</th>
                    <th className="px-1 py-1 text-[9px] font-bold text-gray-400 uppercase border-l border-gray-100 text-center">Saída</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupedEmployees.length > 0 ? (
                groupedEmployees.map((group) => (
                  <React.Fragment key={group.name}>
                    {/* Group Header */}
                    <tr className="bg-gray-500">
                      <td colSpan={2 + dateRange.length * 2} className="px-4 py-1.5 text-xs font-black text-white uppercase tracking-widest text-center">
                        {group.name}
                      </td>
                    </tr>
                    {/* Employee Rows */}
                    {group.employees.map((employee) => {
                      const isExpired = hasExpiredDocs(employee);
                      return (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors group">
                          <td className={cn(
                            "px-4 py-2 text-sm font-bold border-r border-gray-100 text-center",
                            isExpired ? "text-red-600" : "text-gray-900"
                          )}>
                            {employee.name.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600 border-r border-gray-100 text-center">
                            {employee.role.toUpperCase()}
                          </td>
                        {dateRange.map((_, idx) => (
                          <React.Fragment key={idx}>
                            <td className="px-1 py-2 border-r border-gray-50 text-center text-[10px] text-gray-400"></td>
                            <td className="px-1 py-2 border-r border-gray-100 text-center text-[10px] text-gray-400"></td>
                          </React.Fragment>
                        ))}
                      </tr>
                    )})}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={2 + dateRange.length * 2} className="px-6 py-12 text-center text-gray-400">
                    Nenhum dado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Gate;
