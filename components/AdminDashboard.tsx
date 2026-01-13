
import React, { useState, useRef } from 'react';
import { Member, UserRole } from '../types';
import { databaseService } from '../services/databaseService';

interface AdminDashboardProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  onDataImported: () => void;
  currentUserId: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ members, setMembers, currentUserId }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm: Member = {
    id: '', fullName: '', cpf: '', cns: '', birthDate: '', password: '1234',
    gender: 'Masculino', workplace: '', microArea: '', team: '', areaType: 'Urbana',
    status: 'Ativo', registrationDate: new Date().toISOString().split('T')[0],
    profileImage: '', role: UserRole.ACS
  };

  const [formData, setFormData] = useState<Member>(initialForm);
  const [newPassword, setNewPassword] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMember = editingMember 
      ? formData 
      : { ...formData, id: `acs-${Date.now()}` };

    await databaseService.saveMember(finalMember);
    setIsModalOpen(false);
    setEditingMember(null);
    setFormData(initialForm);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember && newPassword) {
      await databaseService.saveMember({ ...editingMember, password: newPassword });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      alert("Senha atualizada com sucesso!");
    }
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setIsModalOpen(true);
  };

  const openPasswordReset = (member: Member) => {
    setEditingMember(member);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const toggleAdminRole = async (member: Member) => {
    if (member.id === currentUserId) {
      alert("Para sua segurança, você não pode remover seus próprios privilégios de Admin enquanto estiver logado.");
      return;
    }

    const isPromoting = member.role !== UserRole.ADMIN;
    const confirmMsg = isPromoting 
      ? `Deseja dar acesso de ADMINISTRADOR para ${member.fullName}?\n\nEsta pessoa poderá apagar sócios e ver todas as senhas.`
      : `Deseja remover o acesso de Admin de ${member.fullName}?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        const updatedMember = { ...member, role: isPromoting ? UserRole.ADMIN : UserRole.ACS };
        await databaseService.saveMember(updatedMember);
      } catch (err) {
        alert("Erro ao atualizar cargo no banco de dados.");
      }
    }
  };

  const deleteMember = async (id: string, name: string) => {
    if (id === currentUserId) {
      alert("Você não pode excluir seu próprio cadastro enquanto o estiver usando.");
      return;
    }
    if (window.confirm(`🚨 EXCLUSÃO DEFINITIVA: Deseja apagar ${name}?`)) {
      await databaseService.deleteMember(id);
    }
  };

  // Encontra o registro do admin atual na lista de membros (se houver)
  const myProfile = members.find(m => m.id === currentUserId);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black text-emerald-900 uppercase tracking-tighter leading-none">Gestão Administrativa</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Controle de Segurança e Membros</p>
        </div>
        
        <div className="flex bg-slate-100 p-2 rounded-[1.5rem] shadow-inner w-full md:w-auto">
          <button onClick={() => setActiveTab('members')} className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${activeTab === 'members' ? 'bg-white shadow-md text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}>Lista de Sócios</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${activeTab === 'settings' ? 'bg-white shadow-md text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}>Configurações</button>
        </div>
      </header>

      {activeTab === 'members' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-200">👥</div>
                <div>
                   <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Base de Dados</p>
                   <p className="text-lg font-black text-emerald-900 leading-none">{members.length} Agentes Cadastrados</p>
                </div>
             </div>
             <button 
              onClick={() => { setEditingMember(null); setFormData(initialForm); setIsModalOpen(true); }}
              className="w-full md:w-auto bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <span>➕</span> Novo Agente
            </button>
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-6">Informações do Agente</th>
                    <th className="px-8 py-6 text-center">Nível de Acesso</th>
                    <th className="px-8 py-6 text-center">Gerenciar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map(m => (
                    <tr key={m.id} className={`hover:bg-slate-50/80 transition-all ${m.id === currentUserId ? 'bg-emerald-50/40' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
                            {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover" /> : <span className="text-slate-300 font-black">ACS</span>}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                               <p className="font-black text-slate-800 text-sm uppercase">{m.fullName}</p>
                               {m.id === currentUserId && <span className="bg-emerald-600 text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase">Você</span>}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CPF: {m.cpf}</p>
                            <p className="text-[9px] font-black text-emerald-600 uppercase mt-0.5">{m.workplace || 'Secretaria'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <div className="flex flex-col items-center gap-2">
                           <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${m.role === UserRole.ADMIN ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                             {m.role === UserRole.ADMIN ? '⭐ ADMIN' : '👤 ACS PADRÃO'}
                           </div>
                           <button 
                             onClick={() => toggleAdminRole(m)}
                             className="text-[8px] font-black text-blue-600 uppercase underline hover:text-blue-800"
                           >
                             {m.role === UserRole.ADMIN ? 'Remover Admin' : 'Tornar Admin'}
                           </button>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center items-center gap-3">
                          <button onClick={() => openPasswordReset(m)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Redefinir Senha">🔑</button>
                          <button onClick={() => openEdit(m)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">✏️</button>
                          <button onClick={() => deleteMember(m.id, m.fullName)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-900 text-white rounded-3xl flex items-center justify-center text-2xl shadow-lg">🛠️</div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Meu Perfil Admin</h3>
              </div>

              {myProfile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <div className="w-20 h-20 rounded-2xl bg-white shadow-sm overflow-hidden flex-shrink-0">
                       {myProfile.profileImage ? <img src={myProfile.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                     </div>
                     <div>
                        <p className="text-lg font-black text-slate-800 uppercase leading-tight">{myProfile.fullName}</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Cargo: Administrador</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => openPasswordReset(myProfile)}
                      className="flex items-center justify-center gap-3 bg-amber-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
                    >
                      <span>🔑</span> Redefinir Minha Senha
                    </button>
                    <button 
                      onClick={() => openEdit(myProfile)}
                      className="flex items-center justify-center gap-3 bg-emerald-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
                    >
                      <span>✏️</span> Editar Meus Dados
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-amber-50 rounded-3xl border border-amber-200 text-center">
                   <p className="text-amber-800 text-sm font-bold uppercase tracking-tight">Você entrou com a Senha Mestra.</p>
                   <p className="text-amber-600 text-[10px] uppercase font-black mt-2">DICA: Cadastre seu CPF como sócio e se torne Admin para ter um perfil completo.</p>
                </div>
              )}
           </div>

           <div className="bg-emerald-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl font-black uppercase tracking-tighter relative z-10">Segurança Cloud</h3>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">☁️</div>
                    <p className="text-xs font-bold uppercase tracking-widest">Sincronização Firebase Ativa</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">🔒</div>
                    <p className="text-xs font-bold uppercase tracking-widest">Controle de Privilégios Real-Time</p>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full"></div>
           </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE DADOS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-3xl shadow-2xl my-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-emerald-900 uppercase">Editar Dados</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-rose-600 text-2xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 flex flex-col items-center mb-4">
                  <div className="w-24 h-24 bg-slate-100 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden mb-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
               </div>

               <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome Completo</label>
                <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Cargo Administrativo</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full p-5 bg-emerald-50 border border-emerald-100 rounded-2xl font-black text-emerald-900 outline-none"
                >
                  <option value={UserRole.ACS}>SÓCIO COMUM (ACS)</option>
                  <option value={UserRole.ADMIN}>ADMINISTRADOR DO APP</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">CPF (Acesso)</label>
                <input required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>

              <div className="md:col-span-2 flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-900 text-white py-4 rounded-2xl font-black uppercase shadow-xl tracking-widest text-xs">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXCLUSIVO DE REDEFINIÇÃO DE SENHA */}
      {isPasswordModalOpen && editingMember && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🔑</div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Alterar Senha</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Sócio: {editingMember.fullName}</p>
              </div>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nova Senha de Acesso</label>
                    <input 
                      required 
                      autoFocus
                      type="text"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Ex: 1234, 4321, etc"
                      className="w-full p-5 bg-slate-50 border-2 border-amber-100 rounded-2xl font-black text-center text-2xl tracking-widest outline-none focus:border-amber-500"
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Confirmar Nova Senha</button>
                    <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
