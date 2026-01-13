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

/* ================= VARIÁVEL DE AMBIENTE ================= */
const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD;
/* ======================================================== */

const DEFAULT_APS: APSIndicator[] = [
  { code: 'C1', title: 'Pré-Natal (6 Consultas)', description: 'Proporção de gestantes com pelo menos 6 consultas.', cityValue: '0%', status: 'Regular' },
  { code: 'C2', title: 'Pré-Natal (Sífilis e HIV)', description: 'Exames realizados no 1º trimestre.', cityValue: '0%', status: 'Regular' },
  { code: 'C3', title: 'Saúde Bucal Gestante', description: 'Atendimento odontológico realizado.', cityValue: '0%', status: 'Regular' },
  { code: 'C4', title: 'Citopatológico', description: 'Cobertura de exame preventivo.', cityValue: '0%', status: 'Regular' },
  { code: 'C5', title: 'Vacinação Infantil', description: 'Cobertura Polio e Pentavalente.', cityValue: '0%', status: 'Regular' },
  { code: 'C6', title: 'Hipertensão', description: 'PA aferida no semestre.', cityValue: '0%', status: 'Regular' },
  { code: 'C7', title: 'Diabetes', description: 'Hemoglobina Glicada.', cityValue: '0%', status: 'Regular' }
];

const DEFAULT_DENTAL: DentalIndicator[] = [
  { code: 'B1', title: 'Atendimento Gestante', status: 'Regular' },
  { code: 'B2', title: 'Procedimentos Coletivos', status: 'Regular' },
  { code: 'B3', title: 'Tratamento Concluído', status: 'Regular' },
  { code: 'B4', title: 'Escovação Supervisionada', status: 'Regular' },
  { code: 'B5', title: 'Urgência Odontológica', status: 'Regular' },
  { code: 'B6', title: 'Acesso Atenção Básica', status: 'Regular' }
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ cpf: '', password: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= FIREBASE ================= */
  useEffect(() => {
    const unsubMembers = databaseService.subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    });

    const unsubAPS = databaseService.subscribeAPS((data) => {
      setApsIndicators(data.length ? data : DEFAULT_APS);
    });

    const unsubDental = databaseService.subscribeDental((data) => {
      setDentalIndicators(data.length ? data : DEFAULT_DENTAL);
    });

    return () => {
      unsubMembers();
      unsubAPS();
      unsubDental();
    };
  }, []);
  /* ============================================ */

  useEffect(() => {
    localStorage.setItem('acs_auth_v10', JSON.stringify(authState));
  }, [authState]);

  /* ================= LOGIN USUÁRIO ================= */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cpfClean = loginForm.cpf.replace(/\D/g, '');

    const user = members.find(
      m =>
        m.cpf.replace(/\D/g, '') === cpfClean &&
        (m.password === loginForm.password || (!m.password && loginForm.password === '1234'))
    );

    if (!user) {
      alert('CPF ou senha incorretos.');
      return;
    }

    if (user.status !== 'Ativo') {
      alert('Cadastro pendente de aprovação.');
      return;
    }

    setAuthState({
      user: { id: user.id, name: user.fullName, role: user.role || UserRole.ACS }
    });
    setShowUserLogin(false);
    setLoginForm({ cpf: '', password: '' });
  };
  /* ================================================ */

  /* ================= LOGIN ADMIN (FINAL) ================= */
  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!MASTER_PASSWORD) {
      alert('Senha mestre não configurada na Vercel.');
      return;
    }

    if (adminPassword === MASTER_PASSWORD) {
      setAuthState({
        user: {
          id: 'admin-01',
          name: 'Administrador Mestre',
          role: UserRole.ADMIN
        }
      });
      setShowAdminLogin(false);
      setAdminPassword('');
      setActiveTab('members');
    } else {
      alert('Senha administrativa inválida.');
    }
  };
  /* ====================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex items-center justify-center text-white">
        <Logo className="w-20 h-20 animate-pulse" />
        <span className="ml-4 font-black text-xl">Conectando...</span>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) =>
        tab === 'members' && authState.user?.role !== UserRole.ADMIN
          ? setShowAdminLogin(true)
          : setActiveTab(tab)
      }
      userRole={authState.user?.role || UserRole.ACS}
      userName={authState.user?.name || 'Visitante'}
      onLogout={() => {
        setAuthState({ user: GUEST_USER });
        setActiveTab('dashboard');
      }}
    >
      {activeTab === 'members' && authState.user?.role === UserRole.ADMIN && (
        <AdminDashboard
          members={members}
          setMembers={setMembers}
          currentUserId={authState.user.id}
          onDataImported={() => {}}
        />
      )}

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form onSubmit={handleAdminVerify} className="bg-white p-8 rounded-2xl w-full max-w-sm text-center">
            <h2 className="font-black text-xl mb-4">🔒 ÁREA RESTRITA</h2>
            <input
              type="password"
              placeholder="SENHA MESTRA"
              className="w-full p-4 border rounded-xl mb-4 text-center font-black"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1">
                Voltar
              </button>
              <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-xl py-3">
                Verificar
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default App;
