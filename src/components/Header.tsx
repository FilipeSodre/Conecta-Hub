import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getUserImageUrl } from '../services/imageUtils';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;

const Header: React.FC = () => {
  const { user, setUser } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Função para lidar com erro na carga da imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== '/default-profile.png') {
      target.src = '/default-profile.png';
    }
  };

  return (
    <>
      <header className="relative w-full h-[120px] flex items-center" style={{ backgroundImage: 'url(/fotos/header_Prancheta.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="w-full flex items-center h-full px-0">
          <img src="/fotos/pngs-04.png" alt="Logo Conecta" className="h-[115px] w-auto ml-0 mr-8" style={{ minWidth: '180px', maxWidth: 'none' }} />
          <div className="flex-1" />
          <div className="flex items-center space-x-3 ml-auto text-white pr-8">
            <button aria-label="Buscar" className="p-2 rounded-full hover:bg-brand-purple-dark transition-colors">
              <SearchIcon />
            </button>
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/perfil" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white">
                    <img
                      src={getUserImageUrl(user.foto_perfil)}
                      alt="Foto de perfil"
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                  <span className="text-sm font-nunito font-medium text-white">{user.nome}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-indie-flower"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-yellow text-brand-purple-dark font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Removido o banner de divulgação */}
    </>
  );
};

export default Header;