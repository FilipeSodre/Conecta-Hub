import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { getCompanyLogoUrl } from '../services/imageUtils';

interface Vaga {
  vaga_id: number;
  titulo: string;
  empresa: string;
  logo_empresa?: string;
  descricao: string;
  tipo_trabalho: string;
  prazo: string;
  requisitos: string[];
  usuario_id: number;
  usuario_nome?: string;
  usuario_foto?: string;
  formato_trabalho?: string;
}

const VagasPage: React.FC = () => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVagas, setFilteredVagas] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVagas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/vagas');
        setVagas(response.data);
        setFilteredVagas(response.data);
      } catch (error) {
        setError('Erro ao buscar vagas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVagas();
  }, []);

  // Função para buscar vagas no backend
  const handleSearch = async (term: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/vagas/busca?q=${encodeURIComponent(term)}`);
      setFilteredVagas(response.data);
    } catch (error) {
      setError('Erro ao buscar vagas.');
      // Em caso de erro, usa filtro local
      const filtered = vagas.filter(vaga =>
        vaga.titulo.toLowerCase().includes(term.toLowerCase()) ||
        vaga.empresa.toLowerCase().includes(term.toLowerCase()) ||
        vaga.descricao.toLowerCase().includes(term.toLowerCase()) ||
        vaga.tipo_trabalho.toLowerCase().includes(term.toLowerCase()) ||
        (vaga.formato_trabalho && vaga.formato_trabalho.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredVagas(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com mudanças no input de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredVagas(vagas);
    } else {
      handleSearch(term);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho */}
        <div className="bg-brand-purple p-6 sm:p-8">
          <div className="container mx-auto px-2 sm:px-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Vagas & Briefings</h1>
            <p className="text-white opacity-90 text-sm sm:text-base">
              Encontre oportunidades para trabalhar em projetos incríveis ou publique suas próprias vagas.
            </p>
          </div>
        </div>
        {/* Barra de Busca e Botão */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full">
            <div className="w-full sm:flex-1 relative">
              <input
                type="search"
                placeholder="Buscar vagas por título, empresa, descrição..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-sm sm:text-base"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-purple"></div>
                </div>
              )}
            </div>
            <Link
              to="/vagas/criar"
              className="flex items-center justify-center gap-2 bg-brand-purple text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors w-full sm:w-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Publicar Vaga</span>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
          <span className="ml-4 text-brand-purple font-semibold">Carregando...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho */}
        <div className="bg-brand-purple p-6 sm:p-8">
          <div className="container mx-auto px-2 sm:px-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Vagas & Briefings</h1>
            <p className="text-white opacity-90 text-sm sm:text-base">
              Encontre oportunidades para trabalhar em projetos incríveis ou publique suas próprias vagas.
            </p>
          </div>
        </div>
        {/* Barra de Busca e Botão */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full">
            <div className="w-full sm:flex-1 relative">
              <input
                type="search"
                placeholder="Buscar vagas por título, empresa, descrição..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-sm sm:text-base"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Link
              to="/vagas/criar"
              className="flex items-center justify-center gap-2 bg-brand-purple text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors w-full sm:w-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Publicar Vaga</span>
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="text-red-600 font-semibold">{error}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-brand-purple p-6 sm:p-8">
        <div className="container mx-auto px-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Vagas & Briefings</h1>
          <p className="text-white opacity-90 text-sm sm:text-base">
            Encontre oportunidades para trabalhar em projetos incríveis ou publique suas próprias vagas.
          </p>
        </div>
      </div>

      {/* Barra de Busca e Botão */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full">
          <div className="w-full sm:flex-1 relative">
            <input
              type="search"
              placeholder="Buscar vagas por título, empresa, descrição..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-sm sm:text-base"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-purple"></div>
              </div>
            )}
          </div>
          <Link
            to="/vagas/criar"
            className="flex items-center justify-center gap-2 bg-brand-purple text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors w-full sm:w-auto"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Publicar Vaga</span>
          </Link>
        </div>

        {/* Resultados da busca */}
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            {filteredVagas.length > 0 ? (
              <span>Encontradas {filteredVagas.length} vaga{filteredVagas.length !== 1 ? 's' : ''} para "{searchTerm}"</span>
            ) : (
              <span>Nenhuma vaga encontrada para "{searchTerm}"</span>
            )}
          </div>
        )}
      </div>

      {/* Grid de Vagas */}
      <div className="container mx-auto px-2 sm:px-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
          </div>
        ) : (
          <div className="sm:grid sm:grid-cols-2 md:grid-cols-3 gap-6 flex flex-row sm:flex-row overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 -mx-2 sm:mx-0">
            {filteredVagas.map((vaga) => (
              <Link key={vaga.vaga_id} to={`/vagas/${vaga.vaga_id}`}
                className="block min-w-[270px] max-w-[350px] w-[85vw] sm:w-auto mx-2 sm:mx-0 flex-shrink-0 sm:flex-shrink"
              >
                <div className="group relative">
                  {/* Borda roxa superior arredondada */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-brand-purple rounded-t-xl z-10"></div>

                  {/* Corpo da pasta */}
                  <div className="bg-black pt-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        {vaga.logo_empresa ? (
                          <img
                            src={getCompanyLogoUrl(vaga.logo_empresa)}
                            alt={vaga.empresa}
                            className="w-12 h-12 rounded-full object-contain bg-white p-1"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-600">
                              {vaga.empresa.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-white font-bold line-clamp-2 truncate max-w-full">{vaga.titulo}</h3>
                          <p className="text-gray-400 text-sm truncate max-w-full">{vaga.empresa}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="bg-brand-purple text-white text-xs px-3 py-1 rounded-full">
                          {vaga.tipo_trabalho}
                        </span>
                        <span className="bg-brand-purple text-white text-xs px-3 py-1 rounded-full">
                          {vaga.prazo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VagasPage;
