
export enum UserRole {
  ADMIN = 'ADMIN',
  ACS = 'ACS'
}

export interface Member {
  id: string;
  fullName: string;
  cpf: string;
  cns: string;
  birthDate: string;
  password?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  workplace?: string;
  microArea: string;
  team: string;
  areaType: 'Rural' | 'Urbana';
  profileImage?: string;
  registrationDate: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  role: UserRole; // Campo obrigatório para controle de acesso
}

export interface NewsItem {
  title: string;
  summary: string;
  content: string;
  date: string;
  url: string;
}

export interface APSIndicator {
  code: string;
  title: string;
  description: string;
  cityValue: string;
  status: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
}

export interface DentalIndicator {
  code: string;
  title: string;
  status: 'Ótimo' | 'Bom' | 'Suficiente' | 'Regular';
}

export interface AuthState {
  user: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}
