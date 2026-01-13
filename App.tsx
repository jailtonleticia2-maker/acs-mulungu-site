
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import ProfileSection from './components/ProfileSection';
import NewsSection from './components/NewsSection';
import PayslipSection from './components/PayslipSection';
import IndicatorsSection from './components/IndicatorsSection';
import Logo from './components/Logo';
import { databaseService } from './services/databaseService';
import { Member, UserRole, AuthState, APSIndicator, DentalIndicator } from './types';

const DEFAULT_APS: APSIndicator[] = [
  { code: 'C1', title: 'Pré-Natal (6 Consultas)', description: 'Proporção de gestantes com pelo menos 6 consultas.', cityValue: '0%', status: 'Regular' },
  { code: 'C2', title: 'Pré-Natal (Sífilis e HIV)', description: 'Exames realizados no 1º trimestre.', cityValue: '0%', status: 'Regular' },
  { code: 'C3', title: 'Saúde Bucal Gestante', description: 'Atendimento odontológico realizado.', cityValue: '0%', status: 'Regular' },
  { code: 'C4', title: 'Citopatológico', description: 'Cobertura de exame preventivo (Papanicolau).', cityValue: '0%', status: 'Regular' },
  { code: 'C5', title: 'Vacinação Infantil', description: 'Cobertura de Polio e Pentavalente.', cityValue: '0%', status: 'Regular' },
  { code: 'C6', title: 'Hipertensão', description: 'Pessoas com PA aferida no semestre.', cityValue: '0%', status: 'Regular' },
  { code: 'C7', title: 'Diabetes', description: 'Solicitação de Hemoglobina Glicada.', cityValue: '0%', status: 'Regular' }
];

const DEFAULT_DENTAL: DentalIndicator[] = [
  { code: 'B1', title: 'Atendimento Gestante', status: 'Regular' },
  { code: 'B2', title: 'Procedimentos Coletivos', status: 'Regular' },
  { code: 'B3', title: 'Tratamento Concluído', status: 'Regular' },
  { code: 'B4', title: 'Escovação Supervisionada', status: 'Regular' },
  { code: 'B5', title: 'Urgência Odontológica', status: 'Regular' },
  { code: 'B6', title: 'Acesso na Atenção Básica', status: 'Regular' }
];

const GUEST_USER = { id: 'guest', name: 'Visitante', role: UserRole.ACS };

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('acs_auth_v10');
    return saved ? JSON.parse(saved) : { user: GUEST_USER };
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [apsIndicators, setApsIndicators] = useState<APSIndicator[]>([]);
  const [dentalIndicators, setDentalIndicators] = useState<DentalIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [registrationState, setRegistrationState] = useState<'closed' | 'form' | 'success'>('closed');
  const [loginForm, setLoginForm] = useState({ cpf: '', password: '' });
  const [registrationPhoto, setRegistrationPhoto] = useState<string>('');
  const [regArea, setRegArea] = useState<'Rural' | 'Urbana'>('Urbana');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDemoMode) {
      setMembers([]);
      setApsIndicators(DEFAULT_APS);
      setDentalIndicators(DEFAULT_DENTAL);
      setLoading(false);
      return;
    }

    const handleErr = (err: any) => {
      console.error("Erro Firebase Detalhado:", err);
      if (err.code === 'permission-denied') {
        setPermissionError(true);
      }
      setLoading(false);
    };

    const unsubMembers = databaseService.subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    }, handleErr);

    const unsubAPS = databaseService.subscribeAPS(async (data) => {
      if (data.length === 0 && !permissionError && !isDemoMode) {
        try {
          await databaseService.seedInitialData(DEFAULT_APS, DEFAULT_DENTAL);
        } catch (e) {
          console.warn("Falha ao semear dados iniciais");
        }
      } else {
        setApsIndicators(data);
      }
    }, handleErr);

    const unsubDental = databaseService.subscribeDental((data) => {
      if (data.length > 0) setDentalIndicators(data);
    }, handleErr);

    return () => {
      unsubMembers();
      unsubAPS();
      unsubDental();
    };
  }, [permissionError, isDemoMode]);

  useEffect(() => {
    localStorage.setItem('acs_auth_v10', JSON.stringify(authState));
  }, [authState]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = loginForm.cpf.replace(/\D/g, '');
    const user = members.find(m => 
      m.cpf.replace(/\D/g, '') === cleanCpf && 
      (m.password === loginForm.password || (!m.password && loginForm.password === '1234'))
    );

    if (user) {
      if (user.status === 'Ativo') {
        setAuthState({ user: { id: user.id, name: user.fullName, role: user.role || UserRole.ACS } });
        setShowUserLogin(false);
        setLoginForm({ cpf: '', password: '' });
      } else {
        alert('Seu cadastro ainda está PENDENTE DE APROVAÇÃO.');
      }
    } else {
      alert('CPF ou senha incorretos.');
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setAuthState({ user: { id: 'admin-01', name: 'Administrador Mestre', role: UserRole.ADMIN } });
      setShowAdminLogin(false);
      setAdminPassword('');
      setActiveTab('members');
    } else {
      alert('Senha administrativa inválida.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <Logo className="w-24 h-24 mb-8 animate-pulse" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Conectando...</h2>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-emerald-900 tracking-tight uppercase">Portal ACS Mulungu</h2>
                <p className="text-slate-500 font-medium italic">
                  {authState.user?.id === 'guest' ? 'Bem-vindo(a) ao portal da associação' : `Olá, ${authState.user?.name}`}
                </p>
              </div>
              <div className="flex gap-3">
                {authState.user?.id === 'guest' && (
                  <button onClick={() => setRegistrationState('form')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-[10px]">
                    Ficha de Inscrição
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <button onClick={() => setActiveTab('indicators')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">📊</div>
                <h3 className="text-xl font-bold text-slate-800">Indicadores</h3>
                <p className="text-slate-500 text-sm mt-2">Saúde Brasil 360.</p>
              </button>
              <button onClick={() => setActiveTab('news')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">📰</div>
                <h3 className="text-xl font-bold text-slate-800">Notícias MS</h3>
                <p className="text-slate-500 text-sm mt-2">Informativos oficiais.</p>
              </button>
              <button onClick={() => setActiveTab('payslip')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">💰</div>
                <h3 className="text-xl font-bold text-slate-800">Contracheque</h3>
                <p className="text-slate-500 text-sm mt-2">Portal Transparência.</p>
              </button>
              <button onClick={() => setActiveTab('profile')} className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 text-left hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">🪪</div>
                <h3 className="text-xl font-bold text-slate-800">Carteirinha</h3>
                <p className="text-slate-500 text-sm mt-2">Identidade Profissional.</p>
              </button>
            </div>
            
            <div className="bg-emerald-900 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <h2 className="text-5xl font-black mb-6 leading-tight max-w-xl">Tecnologia a serviço do Agente.</h2>
              <p className="text-emerald-100 text-xl opacity-80 leading-relaxed max-w-lg mb-10">
                O aplicativo está sincronizado com a nuvem. Suas informações, indicadores e notícias são atualizadas em tempo real.
              </p>
              <Logo className="absolute -bottom-20 -right-20 w-96 h-96 opacity-10 rotate-12" />
            </div>
          </div>
        );
      case 'members':
        return <AdminDashboard members={members} setMembers={setMembers} onDataImported={() => {}} currentUserId={authState.user?.id || ''} />;
      case 'indicators':
        return <IndicatorsSection apsIndicators={apsIndicators} setApsIndicators={setApsIndicators} dentalIndicators={dentalIndicators} setDentalIndicators={setDentalIndicators} isAdmin={authState.user?.role === UserRole.ADMIN} />;
      case 'profile':
        const member = members.find(m => m.id === authState.user?.id);
        return <ProfileSection member={member} isGuest={authState.user?.id === 'guest'} onOpenLogin={() => setShowUserLogin(true)} />;
      case 'news':
        return <NewsSection />;
      case 'payslip':
        return <PayslipSection />;
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => (tab === 'members' && authState.user?.role !== UserRole.ADMIN) ? setShowAdminLogin(true) : setActiveTab(tab)} 
      userRole={authState.user?.role || UserRole.ACS} 
      userName={authState.user?.name || 'Visitante'}
      onLogout={() => { setAuthState({ user: GUEST_USER }); setActiveTab('dashboard'); }}
    >
      {renderContent()}

      {showUserLogin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-md w-full relative">
            <button onClick={() => setShowUserLogin(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 text-2xl">✕</button>
            <div className="text-center mb-8">
              <Logo className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Entrar no Portal</h3>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu CPF</label>
                <input placeholder="000.000.000-00" className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Senha</label>
                <input type="password" placeholder="••••••••" className="w-full p-5 bg-slate-50 border rounded-2xl" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Acessar Portal</button>
            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center z-[120] p-4 text-center">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-sm w-full">
            <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">🔒 Área Restrita</h3>
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <input type="password" placeholder="SENHA MESTRA" className="w-full p-5 bg-slate-50 border rounded-2xl text-center text-2xl font-black tracking-widest outline-none focus:ring-2 focus:ring-emerald-500" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} autoFocus required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Voltar</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Verificar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {registrationState === 'form' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[3rem] p-8 md:p-10 max-w-xl w-full shadow-2xl my-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Ficha de Inscrição ACS</h3>
                <button onClick={() => setRegistrationState('closed')} className="text-slate-300 hover:text-rose-600 text-2xl">✕</button>
             </div>
             <form onSubmit={async (e) => {
               e.preventDefault();
               const target = e.target as any;
               const newMember: Member = {
                 id: `acs-${Date.now()}`,
                 fullName: target[0].value.toUpperCase(),
                 birthDate: target[1].value,
                 cpf: target[2].value.replace(/\D/g, ''),
                 areaType: regArea,
                 workplace: target[3].value.toUpperCase(),
                 team: target[4].value.toUpperCase(),
                 microArea: target[5].value,
                 profileImage: registrationPhoto,
                 cns: '',
                 password: '1234',
                 status: 'Pendente',
                 registrationDate: new Date().toISOString(),
                 role: UserRole.ACS,
               };
               await databaseService.saveMember(newMember);
               setRegistrationPhoto('');
               setRegistrationState('success');
             }} className="space-y-4">
               <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl border-2 border-emerald-100 flex items-center justify-center overflow-hidden mb-3 shadow-inner relative group" onClick={() => fileInputRef.current?.click()}>
                    {registrationPhoto ? <img src={registrationPhoto} className="w-full h-full object-cover" /> : <span className="text-3xl text-slate-300">📷</span>}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setRegistrationPhoto(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Anexar Foto Profissional</p>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nome do Agente</label>
                 <input placeholder="EX: MARIA JOSÉ DA SILVA" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nascimento</label>
                   <input type="date" className="w-full p-4 bg-slate-50 border rounded-xl font-bold uppercase text-[10px]" required />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">CPF</label>
                   <input placeholder="000.000.000-00" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Tipo de Área</label>
                 <div className="flex gap-2">
                   <button type="button" onClick={() => setRegArea('Urbana')} className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] border-2 transition-all ${regArea === 'Urbana' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Urbana</button>
                   <button type="button" onClick={() => setRegArea('Rural')} className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] border-2 transition-all ${regArea === 'Rural' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Rural</button>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Unidade de Saúde</label>
                 <input placeholder="EX: PSF CENTRO" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Equipe</label>
                   <input placeholder="EX: EQUIPE 02" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nº Área</label>
                   <input placeholder="00" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                 </div>
               </div>

               <div className="flex gap-4 pt-4">
                 <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all">ENVIAR FICHA DE INSCRIÇÃO</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {registrationState === 'success' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl max-w-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">✅</div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Inscrição Enviada!</h3>
            <p className="mb-8 text-slate-500 font-medium leading-relaxed">Sua ficha foi enviada para a diretoria. Você poderá acessar sua carteirinha assim que seu CPF for ativado no sistema.</p>
            <button onClick={() => setRegistrationState('closed')} className="w-full bg-emerald-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl">Entendido</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
