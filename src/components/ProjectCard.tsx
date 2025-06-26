import React from 'react';

const ProjectCard: React.FC = () => {
  const backgroundImageUrl = 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

  return (
    <div className="relative w-full max-w-6xl aspect-[16/8] rounded-3xl shadow-2xl overflow-hidden bg-black">
      <div className="absolute top-0 right-0 h-full w-[55%]">
        <img
          src={backgroundImageUrl}
          alt="Equipe de negócios unindo as mãos em colaboração"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-black via-black to-transparent flex items-center">
        <div className="w-full p-8 md:p-12 lg:p-16 lg:pr-24">
          {/* Logo/Imagem personalizada */}
          <div className="absolute top-8 left-8 md:top-12 md:left-12">
            <img src="/fotos/botao-conecta.png" alt="Conecta Logo" className="w-16 h-16 object-contain" />
          </div>
          <div className="space-y-6 mt-16 md:mt-0">
            <h1 className="font-hand text-4xl md:text-5xl text-[#FDE047] leading-tight">
              Encontre o time ideal para tirar seu projeto do papel.
            </h1>
            <p className="text-white/90 text-base md:text-lg">
              Na Conecta, você publica sua vaga, descreve seu desafio e recebe conexões com estudantes talentosos das áreas de design e tecnologia.
            </p>
            <p className="font-hand text-xl md:text-2xl text-[#FDE047]">
              Poste sua vaga gratuitamente e comece a construir com quem quer crescer junto!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
