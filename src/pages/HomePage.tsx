import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import apiClient from '../services/api';
import { useUser } from '../context/UserContext';

// Placeholder Icons (replace with actual SVGs or library)
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>;
const PartnershipIcon = () => <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const ShowcaseIcon = () => <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h10l-1-1-0.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const LearningIcon = () => <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m7.071-7.071l-1.414-1.414M4.929 4.929L6.343 6.343m0 11.314l-1.414 1.414M19.071 4.929l-1.414 1.414M4.929 19.071l1.414-1.414M12 12l3.536 3.536M12 12l-3.536 3.536"></path></svg>;

// Ícones para novidades
const DownloadIcon = () => (
  <svg className="w-10 h-10 text-brand-yellow mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-4-4m4 4l4-4m-7 8h10" /></svg>
);
const DarkModeIcon = () => (
  <svg className="w-10 h-10 text-brand-yellow mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
);
const RecommendIcon = () => (
  <svg className="w-10 h-10 text-brand-yellow mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9l-2 2-2-2m0 6l2-2 2 2m-2-2v.01" /></svg>
);
const CalendarIcon = () => (
  <svg className="w-10 h-10 text-brand-yellow mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" /></svg>
);

const novidadesIcones = [
  DownloadIcon,
  DarkModeIcon,
  RecommendIcon,
  CalendarIcon,
];

const mockNovidades = [
  { id: 1, title: "Download de Códigos", desc: "Baixe códigos e protótipos.", img: "/images/placeholder-code.png", bgColor: "bg-slate-700" },
  { id: 2, title: "Tema Escuro Disponível", desc: "Navegue com conforto visual.", img: "/images/placeholder-darkmode.png", bgColor: "bg-gray-800" },
  { id: 3, title: "Recomendações Personalizadas", desc: "Projetos baseados no seu interesse.", img: "/images/placeholder-recommend.png", bgColor: "bg-purple-700" },
  { id: 4, title: "Novo Sistema de Agendamento", desc: "Agende conversas em tempo real.", img: "/images/placeholder-calendar.png", bgColor: "bg-sky-700" },
];

// const mockAmigosPostando = [
//   { id: 1, user: "Maria Lima", userImg: "/fotos/avatar-maria.png", projectTitle: "Desenvolvimento de Aplicativo", projectDesc: "Aplicativo para academia.", projectImg: "/fotos/project-app-fitness.png" },
//   { id: 2, user: "João Gomes", userImg: "/fotos/avatar-joao.png", projectTitle: "FeedUp com treinos e registros", projectDesc: "Interface para app de treinos.", projectImg: "/fotos/project-feedup.png" },
//   { id: 3, user: "Caio Junior", userImg: "/fotos/avatar-caio.png", projectTitle: "Desenvolvimento de Aplicativo", projectDesc: "Aplicativo para aulas de tênis.", projectImg: "/fotos/project-tennis.png" },
//   { id: 4, user: "Prof. Anderson", userImg: "/fotos/avatar-prof.png", projectTitle: "Redesign de Aplicativo", projectDesc: "Novo visual para app educacional.", projectImg: "/fotos/project-redesign.png" },
//   { id: 5, user: "Julia Silva", userImg: "/fotos/avatar-julia.png", projectTitle: "Projeto de Fotodesign", projectDesc: "Ensaio fotográfico conceitual.", projectImg: "/fotos/project-photodesign.png" },
//   { id: 6, user: "Nathalia Montenegro", userImg: "/fotos/avatar-nathalia-m.png", projectTitle: "Identidade Visual", projectDesc: "Marca para startup de IA.", projectImg: "/fotos/project-id-visual.png" },
//   { id: 7, user: "Nathalia Vales Ficher", userImg: "/fotos/avatar-nathalia-f.png", projectTitle: "Campanha de divulgação", projectDesc: "Campanha para marca de moda.", projectImg: "/fotos/project-fashion-camp.png" },
// ];

// Utilitário para padronizar exibição de imagens (Cloudinary, local ou placeholder)
// const getProjectImageUrl = (imgPath?: string) => {
//   if (!imgPath) return '/default-profile.png'; // placeholder global
//   if (imgPath.startsWith('http')) return imgPath;
//   if (imgPath.startsWith('/src/assets/')) return imgPath.replace('/src/assets', '');
//   if (imgPath.startsWith('/public/')) return imgPath.replace('/public', '');
//   // Nunca retorna /uploads ou localhost
//   return '/default-profile.png';
// };

const HomePage: React.FC = () => {
  const { user } = useUser();
  const [sliderRefNovidades] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1.2, spacing: 15 },
    breakpoints: {
      '(min-width: 640px)': { slides: { perView: 2.5, spacing: 20 } },
      '(min-width: 1024px)': { slides: { perView: 3.5, spacing: 25 } },
    },
  });

  // Destaques do mês - usuários reais
  const [destaques, setDestaques] = useState<any[]>([]);
  const [sliderRefDestaques] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: { perView: 1.3, spacing: 15 },
    breakpoints: {
      '(min-width: 640px)': { slides: { perView: 2.5, spacing: 20 } },
      '(min-width: 1024px)': { slides: { perView: 3.5, spacing: 25 } },
    },
  });

  // Conexões recentes do usuário logado
  const [conexoesRecentes, setConexoesRecentes] = useState<any[]>([]);
  const [sliderRefConexoes] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: { perView: 1.3, spacing: 15 },
    breakpoints: {
      '(min-width: 640px)': { slides: { perView: 2.5, spacing: 20 } },
      '(min-width: 1024px)': { slides: { perView: 3.5, spacing: 25 } },
    },
  });

  useEffect(() => {
    async function fetchDestaques() {
      try {
        const res = await apiClient.get('/usuarios');
        // Pega até 7 usuários, ordem pode ser randomizada ou por id
        let users = res.data || [];
        if (users.length > 7) {
          users = users.slice(0, 7);
        }
        setDestaques(users);
      } catch (e) {
        setDestaques([]);
      }
    }
    fetchDestaques();
  }, []);

  useEffect(() => {
    async function fetchConexoes() {
      if (!user?.usuario_id) return;
      try {
        const res = await apiClient.get(`/usuarios/${user.usuario_id}/conexoes-recebidas`);
        // Pega até 5 conexões, mostra o outro usuário
        let conexoes = res.data || [];
        // Mostra o usuário que não é o logado
        conexoes = conexoes
          .map((c: any) => {
            const outro = c.sender_id === user.usuario_id
              ? { usuario_id: c.recipient_id, nome: c.sender_nome, foto_perfil: c.sender_foto }
              : { usuario_id: c.sender_id, nome: c.sender_nome, foto_perfil: c.sender_foto };
            return outro;
          })
          .filter((v: any, i: number, arr: any[]) => arr.findIndex((u: any) => u.usuario_id === v.usuario_id) === i)
          .slice(0, 5);
        setConexoesRecentes(conexoes);
      } catch (e) {
        setConexoesRecentes([]);
      }
    }
    fetchConexoes();
  }, [user]);

  return (
    <div className="space-y-12 px-2 sm:px-4 md:px-8 max-w-screen-xl mx-auto w-full">
      {/* Hero Section - based on home_landing.png or first part of home_completa.png */}
      <section className="relative text-center py-10 sm:py-16 md:py-24 bg-gradient-to-br from-brand-purple-light via-brand-purple to-brand-purple-dark rounded-2xl shadow-xl overflow-hidden mx-auto w-full">
        <div className="absolute inset-0 opacity-20">
          {/* Background pattern if any - e.g., geometric shapes from header */}
          {/* <img src="/fotos/header-bg-pattern.svg" className="w-full h-full object-cover" /> */}
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
            Toda grande <span className="text-brand-yellow">ideia</span> começa
            <br /> com uma boa <span className="text-brand-yellow">conexão</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-purple-200 max-w-2xl mx-auto">
            Junte-se à nossa comunidade de designers e desenvolvedores para criar, colaborar e construir o futuro.
          </p>
          <div className="mt-10">
            <Link
              to="/portfolio"
              className="bg-brand-yellow text-brand-purple-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-400 transition-transform transform hover:scale-105 shadow-lg"
            >
              Explorar Projetos
            </Link>
          </div>
        </div>
      </section>

      {/* Novidades da Plataforma */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-purple-dark mb-4 sm:mb-6">Novidades da Plataforma</h2>
        <div ref={sliderRefNovidades} className="keen-slider overflow-x-auto">
          {mockNovidades.map((novidade, idx) => {
            const Icon = novidadesIcones[idx] || DownloadIcon;
            return (
              <div key={novidade.id} className={`keen-slider__slide ${novidade.bgColor} text-white p-5 rounded-xl shadow-card flex flex-col items-center justify-center min-h-[180px]`}>
                <Icon />
                <h3 className="text-base font-semibold mb-1 text-center leading-tight">{novidade.title}</h3>
                <p className="text-xs opacity-80 text-center leading-snug">{novidade.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Destaques do mês - dados reais */}
      <section>
        <div className="w-full flex flex-col items-start justify-center pl-2">
          <h1 className="text-2xl sm:text-3xl font-indie-flower text-brand-purple-dark leading-tight mb-2">Destaques do mês</h1>
        </div>
        <div ref={sliderRefDestaques} className="keen-slider overflow-x-auto">
          {destaques.length === 0 && (
            <div className="keen-slider__slide bg-white rounded-2xl shadow-card flex items-center justify-center h-[340px] w-[240px] min-w-[240px] max-w-[240px] text-gray-400">
              Nenhum usuário encontrado
            </div>
          )}
          {destaques.map((user) => (
            <Link key={user.usuario_id} to={`/perfil/${user.usuario_id}`} title={user.nome} className="keen-slider__slide w-full max-w-xs mx-auto">
              <div className="flex flex-col items-center bg-white rounded-2xl shadow-card p-0 h-[340px] w-[240px] min-w-[240px] max-w-[240px] overflow-hidden">
                <div className="w-full h-[180px] flex items-center justify-center bg-gray-200 rounded-t-2xl overflow-hidden">
                  <img src={user.foto_perfil || '/default-profile.png'} alt={user.nome} className="object-cover w-full h-full" />
                </div>
                <div className="w-full bg-brand-purple-light rounded-b-2xl flex flex-col items-center p-4 flex-1 justify-center">
                  <h3 className="text-xl font-indie-flower text-brand-purple-dark text-center mb-1 w-full truncate">
                    {user.nome}
                  </h3>
                  <div className="text-base font-bold text-brand-purple-dark text-center font-nunito">
                    {user.tipo === 'designer' ? 'Estudante de Design' : user.tipo === 'ti' ? 'Estudante de TI' : 'Estudante de Ciência da Computação'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Suas Conquistas Recentes */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-purple-dark mb-4 sm:mb-6">Suas Conquistas Recentes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Placeholder conquista cards */}
          {[
            { title: "Portfólio de Prata", desc: "50 curtidas em projetos", icon: "medal" },
            { title: "Colaborador Top", desc: "3 parcerias de sucesso", icon: "users" },
            { title: "Mestre do Código", desc: "1000 linhas de código", icon: "code" },
            { title: "Visionário Criativo", desc: "5 projetos inovadores", icon: "lightbulb" },
          ].map(conquista => (
            <div key={conquista.title} className="bg-brand-yellow p-6 rounded-xl shadow-card text-center">
              {/* Placeholder for icon */}
              <div className="text-4xl text-brand-purple-dark mb-2">🏆</div>
              <h3 className="text-xl font-semibold text-brand-purple-dark mb-1">{conquista.title}</h3>
              <p className="text-sm text-purple-800">{conquista.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rede de Conexões Recentes - dados reais */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-purple-dark mb-4 sm:mb-6">Rede de Conexões Recentes</h2>
        <div ref={sliderRefConexoes} className="keen-slider overflow-x-auto">
          {conexoesRecentes.length === 0 && (
            <div className="keen-slider__slide bg-white rounded-2xl shadow-card flex items-center justify-center h-[180px] w-[180px] min-w-[180px] max-w-[180px] text-gray-400">
              Nenhuma conexão encontrada
            </div>
          )}
          {conexoesRecentes.map((conexao) => (
            <Link key={conexao.usuario_id} to={`/perfil/${conexao.usuario_id}`} title={conexao.nome} className="keen-slider__slide w-full max-w-xs mx-auto">
              <div className="flex flex-col items-center bg-white rounded-2xl shadow-card p-0 h-[180px] w-[180px] min-w-[180px] max-w-[180px] overflow-hidden">
                <div className="w-full h-[100px] flex items-center justify-center bg-gray-200 rounded-t-2xl overflow-hidden">
                  <img src={conexao.foto_perfil || '/default-profile.png'} alt={conexao.nome} className="object-cover w-full h-full" />
                </div>
                <div className="w-full bg-brand-purple-light rounded-b-2xl flex flex-col items-center p-2 flex-1 justify-center">
                  <h3 className="text-base font-indie-flower text-brand-purple-dark text-center mb-1 w-full truncate">
                    {conexao.nome}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* "Sobre a plataforma" "Encontre o time ideal" "Por que usar Conecta?" - from home_landing.png */}
      <section className="py-8 sm:py-12 space-y-8 sm:space-y-16">
        {/* Sobre a plataforma */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12 bg-brand-purple-light p-4 sm:p-8 md:p-12 rounded-2xl shadow-card w-full">
          <div className="md:w-1/2">
            <h3 className="text-3xl font-bold text-brand-purple-dark mb-4">Sobre a Plataforma</h3>
            <p className="text-brand-text leading-relaxed">
              Conecta é o seu hub de tecnologia para colaboração e crescimento. Unimos estudantes de Design Gráfico e Ciência da Computação para transformar ideias em projetos de portfólio incríveis.
            </p>
          </div>
          <div className="md:w-1/2 flex items-center justify-center">
            {/* Ilustração moderna de tecnologia (Unsplash ou SVG) */}
            <img
              src="https://undraw.co/api/illustrations/undraw_online_collaboration_re_bkpm.svg"
              alt="Ilustração de colaboração online"
              className="w-full h-64 object-contain rounded-lg shadow-md bg-white"
              loading="lazy"
            />
          </div>
        </div>

        {/* Encontre o time ideal */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-4 md:gap-12 p-4 sm:p-8 md:p-12 rounded-2xl shadow-card w-full">
          <div className="md:w-1/2">
            <h3 className="text-3xl font-bold text-brand-purple-dark mb-4">Encontre o Time Ideal para seu Projeto</h3>
            <p className="text-brand-text leading-relaxed">
              Publique seus briefings, explore projetos de outros talentos e forme parcerias para desenvolver soluções inovadoras. Acreditamos no poder da colaboração para impulsionar a criatividade.
            </p>
            <Link to="/portfolio" className="mt-6 inline-flex items-center text-brand-purple-dark font-semibold hover:text-brand-purple">
              Buscar Projetos <ArrowRightIcon />
            </Link>
          </div>
          <div className="md:w-1/2 flex items-center justify-center">
            {/* Ilustração moderna de trabalho em equipe (Unsplash ou SVG) */}
            <img
              src="https://undraw.co/api/illustrations/undraw_team_spirit_re_yl1v.svg"
              alt="Ilustração de trabalho em equipe"
              className="w-full h-64 object-contain rounded-lg shadow-md bg-white"
              loading="lazy"
            />
          </div>
        </div>

        {/* Por que usar Conecta? */}
        <div className="flex flex-col md:flex-row items-stretch gap-0 rounded-2xl shadow-card overflow-hidden w-full">
          <div className="md:w-1/2 bg-slate-800 text-white p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Por que usar o <span className="text-brand-yellow">Conecta</span>?</h3>
          </div>
          <div className="md:w-1/2 bg-brand-purple-light p-8 md:p-12">
            <ul className="space-y-6">
              <li className="flex items-start">
                <PartnershipIcon />
                <div className="ml-4">
                  <h4 className="font-semibold text-xl text-brand-purple-dark">Parcerias de Sucesso</h4>
                  <p className="text-brand-text-secondary">Conecte-se com talentos complementares.</p>
                </div>
              </li>
              <li className="flex items-start">
                <ShowcaseIcon />
                <div className="ml-4">
                  <h4 className="font-semibold text-xl text-brand-purple-dark">Divulgação do seu Trabalho</h4>
                  <p className="text-brand-text-secondary">Construa um portfólio impactante.</p>
                </div>
              </li>
              <li className="flex items-start">
                <LearningIcon />
                <div className="ml-4">
                  <h4 className="font-semibold text-xl text-brand-purple-dark">Aprendizagem Prática e Rápida</h4>
                  <p className="text-brand-text-secondary">Desenvolva habilidades em projetos reais.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;
