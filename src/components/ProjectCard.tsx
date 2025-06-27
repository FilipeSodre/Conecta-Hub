import React from 'react';

const ProjectCard: React.FC = () => {
  const backgroundImageUrl = 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

  return (
    <div className="relative w-full max-w-xl aspect-[16/7] rounded-2xl shadow-card overflow-hidden bg-black flex font-nunito mx-auto">
      {/* Imagem à direita */}
      <div className="hidden sm:block absolute top-0 right-0 h-full w-[45%]">
        <img
          src={backgroundImageUrl}
          alt="Equipe de negócios unindo as mãos em colaboração"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Gradiente e conteúdo à esquerda */}
      <div className="relative z-10 flex-1 h-full flex items-center bg-gradient-to-r from-black via-black/90 to-transparent">
        <div className="w-full px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          {/* Logo/Imagem personalizada */}
          <div className="mb-4">
            <img src="/fotos/botao-conecta.png" alt="Conecta Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="font-indie-flower text-2xl sm:text-3xl text-[#FDE047] leading-tight mb-2">
            Encontre o time ideal para tirar seu projeto do papel.
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mb-2 max-w-xs">
            Na Conecta, você publica sua vaga, descreve seu desafio e recebe conexões com estudantes talentosos das áreas de design e tecnologia.
          </p>
          <p className="font-nunito text-sm sm:text-base text-[#FDE047]">
            Poste sua vaga gratuitamente e comece a construir com quem quer crescer junto!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
