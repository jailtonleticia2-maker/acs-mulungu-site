
import React, { useEffect, useState } from 'react';
import { fetchHealthNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      const data = await fetchHealthNews();
      setNews(data);
      setLoading(false);
    };
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">🌐</div>
        </div>
        <div className="text-center">
          <p className="text-emerald-900 font-black uppercase tracking-tighter text-lg">Buscando Notícias Reais</p>
          <p className="text-slate-400 text-sm font-medium">Sincronizando com as últimas portarias do MS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Live: Atualizado Agora</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Informativo ACS Brasil</h2>
          <p className="text-slate-500 font-medium">Notícias reais verificadas pelo Google Search</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map((item, idx) => (
          <article 
            key={idx} 
            onClick={() => setSelectedNews(item)}
            className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-xl border border-emerald-100">FONTE OFICIAL</span>
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{item.date}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors mb-4 leading-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-base leading-relaxed line-clamp-3 mb-8 font-medium italic">
                "{item.summary}"
              </p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Ver Detalhes</span>
              <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">→</span>
            </div>
          </article>
        ))}
      </div>

      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h4 className="text-3xl font-black mb-4 leading-none">Radar de Portarias</h4>
          <p className="text-emerald-100/80 text-lg font-medium max-w-md">
            Mantenha-se informado sobre as decisões que impactam diretamente seu trabalho em Mulungu do Morro.
          </p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-white text-emerald-900 px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-emerald-50 transition-all">
            Assinar Newsletter
          </button>
        </div>
      </div>

      {/* MODAL DE LEITURA DA NOTÍCIA REAL */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[150] flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div 
            className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-8 border-b border-slate-100 flex justify-between items-center z-10">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Informação Verificada</span>
               </div>
               <button onClick={() => setSelectedNews(null)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-2xl font-light">✕</button>
            </div>
            
            <div className="p-10 md:p-16">
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 bg-emerald-900 text-white rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/20">📰</div>
                 <div>
                   <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Publicado em {selectedNews.date}</p>
                   <p className="text-sm font-bold text-slate-500">Agência de Notícias da Saúde</p>
                 </div>
               </div>
               
               <h3 className="text-4xl font-black text-slate-900 mb-10 leading-tight tracking-tighter">{selectedNews.title}</h3>
               
               <div className="space-y-6">
                  {selectedNews.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-600 text-xl leading-relaxed font-medium">
                      {paragraph}
                    </p>
                  ))}
               </div>

               <div className="mt-16 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fonte Original</h5>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">🔗</div>
                      <p className="text-xs font-bold text-blue-600 truncate max-w-[200px] md:max-w-xs">{selectedNews.url}</p>
                    </div>
                    <a 
                      href={selectedNews.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-center"
                    >
                      Acessar Fonte Original ↗
                    </a>
                  </div>
               </div>

               <button 
                onClick={() => setSelectedNews(null)} 
                className="w-full mt-10 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-emerald-700 transition-colors"
               >
                 Voltar para a lista
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
