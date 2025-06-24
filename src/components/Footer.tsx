import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-purple text-white py-4">
      <div className="container mx-auto px-4 text-center flex flex-col items-center justify-center">
        <img src="/fotos/pngs-05.png" alt="Conecta Hub" className="h-40 mb-0" />
        <p className="text-base text-white mt-0 mb-0">
          &copy; 2025 Conecta.<br />Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
