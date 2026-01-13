
import React, { useState } from 'react';
import { APSIndicator, DentalIndicator } from '../types';
import { databaseService } from '../services/databaseService';

interface IndicatorsSectionProps {
  apsIndicators: APSIndicator[];
  setApsIndicators: React.Dispatch<React.SetStateAction<APSIndicator[]>>;
  dentalIndicators: DentalIndicator[];
  setDentalIndicators: React.Dispatch<React.SetStateAction<DentalIndicator[]>>;
  isAdmin: boolean;
}

const IndicatorsSection: React.FC<IndicatorsSectionProps> = ({ 
  apsIndicators, 
  setApsIndicators, 
  dentalIndicators, 
  setDentalIndicators,
  isAdmin 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'aps' | 'dental' | 'calendar'>('aps');
  const [editingItem, setEditingItem] = useState<{ type: 'aps' | 'dental', data: any } | null>(null);

  const statusColors: Record<string, string> = {
    'Ótimo': 'bg-emerald-100 text-emerald-700',
    'Bom': 'bg-blue-100 text-blue-700',
    'Suficiente': 'bg-amber-100 text-amber-700',
    'Regular': 'bg-rose-100 text-rose-700',
  };

  const calendarData = [
    { month: 'Janeiro', range: '01/01 a 31/01', deadline: '14/02/2025' },
    { month: 'Fevereiro', range: '01/02 a 28/02', deadline: '19/03/2025' },
    { month: 'Março', range: '01/03 a 31/03', deadline: '14/04/2025' },
    { month: 'Abril', range: '01/04 a 30/04', deadline: '15/05/2025' },
    { month: 'Maio', range: '01/05 a 31/05', deadline: '13/06/2025' },
    { month: 'Junho', range: '01/06 a 30/06', deadline: '14/07/2025' },
    { month: 'Julho', range: '01/07 a 31/07', deadline: '14/08/2025' },
    { month: 'Agosto', range: '01/08 a 31/08', deadline: '12/09/2025' },
    { month: 'Setembro', range: '01/09 a 30/09', deadline: '14/10/2025' },
    { month: 'Outubro', range: '01/10 a 31/10', deadline: '14/11/2025' },
    { month: 'Novembro', range: '01/11 a 30/11', deadline: '12/12/2025' },
    { month: 'Dezembro', range: '01/12 a 31/12', deadline: '15/01/2026' },
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.type === 'aps') {
      await databaseService.updateAPS(editingItem.data);
      setApsIndicators(prev => prev.map(item => 
        item.code === editingItem.data.code ? editingItem.data : item
      ));
    } else {
      await databaseService.updateDental(editingItem.data);
      setDentalIndicators(prev => prev.map(item => 
        item.code === editingItem.data.code ? editingItem.data : item
      ));
    }
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal de Gestão da Saúde</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Indicadores de Performance</h2>
          <p className="text-slate-500">Monitoramento Multidimensional APS e Saúde Bucal</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveSubTab('aps')} 
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'aps' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}
          >
            APS (C1-C7)
          </button>
          <button 
            onClick={() => setActiveSubTab('dental')} 
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'dental' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}
          >
            Bucal (B1-B6)
          </button>
          <button 
            onClick={() => setActiveSubTab('calendar')} 
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeSubTab === 'calendar' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-400'}`}
          >
            Calendário
          </button>
        </div>
      </header>

      {activeSubTab === 'aps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apsIndicators.map(indicator => (
            <div key={indicator.code} className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all relative">
              {isAdmin && (
                <button 
                  onClick={() => setEditingItem({ type: 'aps', data: { ...indicator } })}
                  className="absolute top-4 right-4 p-2 bg-emerald-50 text-emerald-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✏️
                </button>
              )}
              <div className="flex justify-between items-start mb-4">
                <span className="w-10 h-10 bg-emerald-900 text-white rounded-xl flex items-center justify-center font-black">{indicator.code}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[indicator.status]}`}>{indicator.status}</span>
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-1 leading-tight">{indicator.title}</h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">{indicator.description}</p>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                <div className="text-[10px] font-black text-slate-300 uppercase">Performance</div>
                <div className="text-3xl font-black text-emerald-700 tracking-tighter">{indicator.cityValue}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'dental' && (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="bg-emerald-600 p-10 text-white">
              <h3 className="text-2xl font-black uppercase tracking-tight">Saúde Bucal em Mulungu</h3>
              <p className="opacity-80">Atualização do Quadrimestre Vigente</p>
           </div>
           <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {dentalIndicators.map(item => (
                <div key={item.code} className="group flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
                   <div className="flex items-center gap-4">
                      <span className="font-black text-emerald-700 text-sm">{item.code}</span>
                      <span className="font-black text-slate-700 text-base">{item.title}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                      {isAdmin && (
                        <button 
                          onClick={() => setEditingItem({ type: 'dental', data: { ...item } })}
                          className="p-2 bg-white text-emerald-600 rounded-lg opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                        >
                          ✏️
                        </button>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'calendar' && (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="bg-blue-900 p-10 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Calendário SISAB 2025</h3>
                <p className="opacity-80 font-medium">Cronograma de envio de bases municipais</p>
              </div>
              <span className="text-4xl">📅</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100">
                 <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <th className="px-8 py-6">Mês</th>
                   <th className="px-8 py-6">Intervalo</th>
                   <th className="px-8 py-6">Data Limite</th>
                   <th className="px-8 py-6 text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {calendarData.map((item, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors">
                     <td className="px-8 py-5 font-black text-slate-700">{item.month}</td>
                     <td className="px-8 py-5 text-xs font-bold text-slate-400">{item.range}</td>
                     <td className="px-8 py-5 text-xs font-black text-rose-600 uppercase">{item.deadline}</td>
                     <td className="px-8 py-5 text-right">
                        <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-400 rounded-lg">Aguardando</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DO INDICADOR */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Atualizar Indicador</h3>
            <p className="text-slate-400 mb-8 font-medium">Alterando dados para {editingItem.data.title}</p>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              {editingItem.type === 'aps' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Performance (%)</label>
                  <input 
                    required 
                    type="text" 
                    value={editingItem.data.cityValue}
                    onChange={e => setEditingItem({ ...editingItem, data: { ...editingItem.data, cityValue: e.target.value } })}
                    placeholder="Ex: 55.40%"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classificação Atual</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Ótimo', 'Bom', 'Suficiente', 'Regular'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, data: { ...editingItem.data, status } })}
                      className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                        editingItem.data.status === status 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"
                >
                  Confirmar Atualização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex gap-6 items-center">
         <span className="text-4xl">💡</span>
         <div className="space-y-1">
           <h5 className="font-black text-emerald-900 uppercase text-xs">Aviso aos Associados</h5>
           <p className="text-xs text-emerald-800 font-medium leading-relaxed">
             Os dados acima são atualizados periodicamente pela diretoria da associação com base nos relatórios oficiais do SISAB. 
             Qualquer divergência, favor entrar em contato com o administrador.
           </p>
         </div>
      </div>
    </div>
  );
};

export default IndicatorsSection;
