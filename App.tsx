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
    localStorage.setItem('acs_auth_v10', JSON.stringify(authState));
  }, [authState]);

  /* ================= LOGIN ADMIN (CORRIGIDO) ================= */
  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!MASTER_PASSWORD) {
      alert('Senha mestre não configurada no sistema.');
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
  /* =========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <Logo className="w-24 h-24 mb-8 animate-pulse" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Conectando...</h2>
      </div>
    );
  }

  /* ⚠️ TODO O RESTO DO SEU CÓDIGO PERMANECE IGUAL ⚠️ */

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
      {/* seu renderContent e modais continuam iguais */}
    </Layout>
  );
};

export default App;
