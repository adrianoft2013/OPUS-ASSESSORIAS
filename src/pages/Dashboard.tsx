import React from 'react';
import { 
  Building2, 
  HardHat, 
  ClipboardCheck, 
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { companies, works, inspections, employees } = useApp();

  const stats = [
    { label: 'Construtoras', value: companies.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Obras Ativas', value: works.length, icon: HardHat, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Funcionários', value: employees.length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Vistorias', value: inspections.length, icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const recentInspections = [...inspections]

    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const statusData = [
    { name: 'Conformidade', value: inspections.filter(i => i.status === 'conformity').length },
    { name: 'Não Conformidade', value: inspections.filter(i => i.status === 'non-conformity').length },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  // Mock data for chart if empty
  const chartData = companies.map(c => ({
    name: c.name.split(' ')[0],
    obras: works.filter(w => w.companyId === c.id).length,
    vistorias: inspections.filter(i => i.companyId === c.id).length,
  })).slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo ao sistema de controle de obras.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Obras e Vistorias por Construtora</h2>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="obras" fill="rgb(24, 79, 228)" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="vistorias" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Sem dados suficientes para exibir o gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">Status das Vistorias</h2>
          <div className="h-80 w-full flex flex-col items-center justify-center">
            {inspections.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4">
                  {statusData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-400">Nenhuma vistoria registrada.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-6">Vistorias Recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-bottom border-gray-100">
                <th className="pb-4 font-semibold text-gray-500 text-sm">Obra</th>
                <th className="pb-4 font-semibold text-gray-500 text-sm">Construtora</th>
                <th className="pb-4 font-semibold text-gray-500 text-sm">Data</th>
                <th className="pb-4 font-semibold text-gray-500 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentInspections.length > 0 ? (
                recentInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{inspection.workName}</td>
                    <td className="py-4 text-gray-600">{inspection.companyName}</td>
                    <td className="py-4 text-gray-600">{new Date(inspection.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4">
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
                  <td colSpan={4} className="py-8 text-center text-gray-400">Nenhuma vistoria recente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
