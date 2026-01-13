
import React, { useState } from 'react';
import { Member } from '../types';
import Logo from './Logo';

interface IDCardProps {
  member: Member;
  hidePrintButton?: boolean;
}

const IDCard: React.FC<IDCardProps> = ({ member, hidePrintButton = false }) => {
  const [isPreparing, setIsPreparing] = useState(false);

  const handlePrint = () => {
    setIsPreparing(true);
    const originalTitle = document.title;
    const safeName = member.fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    document.title = `CARTEIRINHA_${safeName}`;
    
    setTimeout(() => {
      window.print();
      setIsPreparing(false);
      document.title = originalTitle;
    }, 1200);
  };

  const CardFront = () => (
    <div className="card-face card-front bg-white w-[85.6mm] h-[53.98mm] rounded-[3mm] overflow-hidden relative border border-slate-300 flex flex-col shadow-lg mx-auto print:shadow-none print:border-slate-500">
      <div className="bg-emerald-900 px-3 py-1.5 flex items-center gap-2 z-10">
        <Logo className="w-6 h-6" />
        <div className="leading-none text-left">
          <h1 className="text-[7px] font-black text-white uppercase leading-none">Associação ACS Mulungu do Morro</h1>
          <p className="text-[5px] text-emerald-300 font-bold uppercase tracking-widest mt-0.5">Identidade Profissional</p>
        </div>
      </div>

      <div className="flex-1 p-3 flex gap-4 z-10 text-left">
        <div className="w-[22mm] h-[28mm] bg-slate-100 rounded-lg border-[1.5px] border-emerald-900 flex-shrink-0 overflow-hidden flex items-center justify-center bg-cover bg-center shadow-inner" 
             style={member.profileImage ? {backgroundImage: `url(${member.profileImage})`} : {}}>
          {!member.profileImage && <span className="text-2xl font-black text-slate-200">ACS</span>}
        </div>

        <div className="flex-1 space-y-1.5 py-0.5">
          <div>
            <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Nome Completo</label>
            <p className="text-[9px] font-black text-slate-900 uppercase leading-tight line-clamp-2">{member.fullName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">CPF</label>
              <p className="text-[7.5px] font-bold text-slate-700">{member.cpf}</p>
            </div>
            <div>
              <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Nascimento</label>
              <p className="text-[7.5px] font-bold text-slate-700">{member.birthDate ? new Date(member.birthDate).toLocaleDateString('pt-BR') : '--/--/----'}</p>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Cargo Profissional</label>
            <p className="text-[7.5px] font-black text-emerald-800 uppercase">Agente Comunitário de Saúde</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center z-10">
        <span className="text-[6px] font-black text-emerald-700 uppercase">Sócio Ativo</span>
        <span className="text-[5px] text-slate-400 font-bold uppercase tracking-widest">Mulungu do Morro - BA</span>
      </div>
    </div>
  );

  const CardBack = () => (
    <div className="card-face card-back bg-white w-[85.6mm] h-[53.98mm] rounded-[3mm] overflow-hidden relative border border-slate-300 flex flex-col shadow-lg mx-auto print:shadow-none print:border-slate-500">
      <div className="p-4 flex flex-col h-full relative z-10 text-left">
        <div className="flex justify-between items-start mb-2">
           <div className="space-y-3 flex-1">
              <div>
                <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Unidade de Saúde</label>
                <p className="text-[7.5px] font-bold text-slate-800 uppercase leading-tight line-clamp-1">{member.workplace || 'SECRETARIA MUNICIPAL'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Equipe / Área</label>
                  <p className="text-[7.5px] font-black text-emerald-800 uppercase leading-none mt-1">
                    {member.team || '---'} / {member.microArea || '---'}
                  </p>
                </div>
                <div>
                  <label className="text-[4.5px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Zona / Área</label>
                  <div className={`mt-1 px-1.5 py-0.5 rounded flex items-center justify-center ${member.areaType === 'Rural' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <p className={`text-[6px] font-black uppercase tracking-tight ${member.areaType === 'Rural' ? 'text-amber-700' : 'text-blue-700'}`}>
                      ZONA {member.areaType || '---'}
                    </p>
                  </div>
                </div>
              </div>
           </div>

           <div className="w-14 h-14 bg-white p-1 border border-slate-100 rounded-lg shadow-sm flex items-center justify-center">
              <div className="grid grid-cols-4 gap-0.5 p-0.5">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-transparent'}`}></div>
                ))}
              </div>
           </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex justify-center flex-col items-center">
             <div className="w-32 h-[0.5pt] bg-slate-300 mb-1"></div>
             <p className="text-[4px] text-slate-400 font-black uppercase">Assinatura Digital da Associação</p>
          </div>
          <p className="text-[4.5px] text-slate-400 text-center leading-tight">
            Este documento é de uso pessoal e intransferível. <br/>
            Válido em todo território nacional conforme estatuto vigente.
          </p>
        </div>
      </div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
        <Logo className="w-40 h-40 rotate-12" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="screen-preview flex flex-col lg:flex-row gap-8 mb-10 no-print items-center">
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frente da Carteira</p>
          <CardFront />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verso da Carteira</p>
          <CardBack />
        </div>
      </div>

      <div id="print-area" className="hidden print:block">
        <div className="print-a4-wrapper">
          <div className="print-item">
            <CardFront />
          </div>
          <div className="print-spacer h-10"></div>
          <div className="print-item">
            <CardBack />
          </div>
        </div>
      </div>

      {!hidePrintButton && (
        <button 
          onClick={handlePrint}
          className="bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-3 no-print hover:scale-105 active:scale-95 transition-all"
        >
          <span>🖨️</span> Imprimir ou Salvar PDF
        </button>
      )}

      <style>{`
        @media print {
          body, html, #root { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute; left: 0; top: 0; width: 210mm; display: flex; flex-direction: column; align-items: center; padding-top: 20mm; }
          .print-item { margin-bottom: 10mm; text-align: center; }
          .card-face { border: 0.2pt solid #ddd !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default IDCard;
