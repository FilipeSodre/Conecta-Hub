// DEBUG: Log antes de qualquer importAdd commentMore actions
try {
    // eslint-disable-next-line no-console
    console.log('[DEBUG] Arquivo PortfolioProjectPage.tsx está sendo carregado (antes dos imports)');
} catch (e) {
    // eslint-disable-next-line no-console
    console.error('[DEBUG] Erro ao tentar logar antes dos imports:', e);
}

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/api';
import ConnectionRequestModal from '../components/ConnectionRequestModal';
import AddCollaboratorModal from '../components/AddCollaboratorModal';

// Tipos auxiliares
interface Usuario {
    usuario_id: number;
    nome: string;
    foto_perfil?: string;
    tipo?: string;
    is_owner?: boolean;
}
interface Projeto {
    projeto_id: number;
    titulo: string;
    descricao: string;
    imagem_capa?: string;
    imagens?: string[];
    link_figma?: string;
    link_github?: string;
    link_drive?: string;
    categoria?: string;
    usuario_id?: number;
    usuario_nome?: string;
    usuario_foto?: string;
    tipo?: string;
    participantes?: { usuario_id: number; nome: string; foto_perfil: string | null; papel: string }[];
}
interface Comentario {
    comentario_id: number;
    projeto_id: number;
    usuario_id: number;
    texto: string;
    data_criacao: string;
    usuario_nome: string;
    usuario_foto: string;
}
// Utilitário para obter o caminho correto da imagem
function getProjectImageUrl(imgPath?: string) {
    if (!imgPath) return '/fotos/default-profile.png';
    if (imgPath.startsWith('http')) return imgPath;
    return `/fotos/${imgPath}`;
}

const PortfolioProjectPage: React.FC = () => {
    try {
        console.log('[DEBUG] PortfolioProjectPage componente iniciou (dentro do try/catch)');
    } catch (err) {
        console.error('[DEBUG] ERRO CRÍTICO NO COMPONENTE PortfolioProjectPage:', err);
        return <div style={{ color: 'red', fontWeight: 'bold' }}>Erro crítico ao renderizar o projeto. Veja o console para detalhes.</div>;
    }

    console.log('O COMPONENTE PortfolioProjectPage FOI MONTADO! A ROTA FUNCIONOU!');

    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [projeto, setProjeto] = useState<Projeto | null>(null);
    const [colaboradores, setColaboradores] = useState<Usuario[]>([]);
    const [likes, setLikes] = useState<number>(0);
    const [hasLiked, setHasLiked] = useState<boolean>(false);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
    const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] = useState(false);
    // Adicionando estado para verificar se o usuário é colaborador ou dono
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    // Remover allProjetos e setAllProjetos pois não são mais usados
    // const [allProjetos, setAllProjetos] = useState<Projeto[]>([]);
    // NOVOS ESTADOS
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Estado para o usuário dono do projeto
    const [ownerUser, setOwnerUser] = useState<Usuario | null>(null);

    // LOGS DE DEBUG NO RENDER
    console.log('[PortfolioProjectPage] Renderizou!');

    // useEffect principal para buscar o projeto de forma eficiente
    useEffect(() => {
        console.log('[PortfolioProjectPage] useEffect projectId:', projectId);
        const fetchPageData = async () => {
            setLoading(true);
            setError(null);
            console.log('[PortfolioProjectPage] --- INICIANDO DEBUG ---');
            console.log('[PortfolioProjectPage] 1. useEffect foi acionado. ID da URL:', projectId);

            if (!projectId) {
                console.error('2. ERRO: O ID do projeto não foi encontrado na URL!');
                setError("ID do projeto não foi encontrado.");
                setLoading(false);
                return;
            }

            try {
                console.log('3. ID do projeto encontrado. Tentando buscar na API...');
                // A chamada de API correta e otimizada
                const response = await apiClient.get(`/projetos/${projectId}`);
                console.log('[PortfolioProjectPage] DADOS DA API:', response.data);
                console.log('4. API respondeu com sucesso. Dados recebidos:', response.data);

                if (response.data) {
                    setProjeto(response.data);
                    console.log('[PortfolioProjectPage] 5. Estado "projeto" atualizado com sucesso.', response.data);
                } else {
                    console.error('[PortfolioProjectPage] 6. ERRO: A API retornou sucesso, mas sem dados de projeto.');
                    setError("Projeto não encontrado.");
                }
            } catch (err) {
                console.error('[PortfolioProjectPage] 7. ERRO CRÍTICO: A chamada para a API falhou!', err);
                setError("Ocorreu um erro ao carregar o projeto.");
            } finally {
                console.log('[PortfolioProjectPage] 8. Bloco FINALLY executado. Finalizando o loading.');
                setLoading(false);
            }
        };
        fetchPageData();
    }, [projectId]);

    const userId = JSON.parse(localStorage.getItem('user') || '{}').usuario_id || 0;

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await apiClient.get(`/curtidas/${projectId}`);
                console.log('Resposta das curtidas:', response.data);
                setLikes(response.data.length);
                // Verifica se o usuário atual já curtiu
                const userLiked = response.data.some((like: any) => like.usuario_id === Number(userId));
                console.log('Usuário curtiu?', userLiked, 'userId:', userId);
                setHasLiked(userLiked);
            } catch (error) {
                console.error('Erro ao buscar curtidas:', error);
            }
        };

        if (projectId) {
            fetchLikes();
        }
    }, [projectId, userId]);

    const handleLikeToggle = async () => {
        console.log('Botão de curtida clicado');
        console.log('Estado atual - hasLiked:', hasLiked, 'userId:', userId);

        if (!userId) {
            alert('Você precisa estar logado para curtir um projeto!');
            navigate('/login');
            return;
        }

        try {
            if (hasLiked) {
                console.log('Tentando remover curtida');
                // Remove like
                const response = await apiClient.get(`/curtidas/${projectId}`);
                const curtida = response.data.find((like: any) => like.usuario_id === Number(userId));
                if (curtida) {
                    await apiClient.delete(`/curtidas/${curtida.curtida_id}`);
                    setLikes(prev => prev - 1);
                    setHasLiked(false);
                }
            } else {
                console.log('Tentando adicionar curtida');
                // Add like
                await apiClient.post('/curtidas', {
                    usuario_id: Number(userId),
                    projeto_id: Number(projectId)
                });
                setLikes(prev => prev + 1);
                setHasLiked(true);
            }
        } catch (error: any) {
            console.error('Erro ao interagir com curtida:', error);
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('Erro ao processar sua curtida. Tente novamente.');
            }
        }
    };

    // Função para carregar comentários
    const carregarComentarios = async () => {
        if (!projectId) return;

        try {
            const response = await apiClient.get(`/comentarios/${projectId}`);
            setComentarios(response.data);
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
        }
    };

    // Carregar comentários quando o componente montar
    useEffect(() => {
        if (projectId) {
            carregarComentarios();
        }
    }, [projectId]);

    useEffect(() => {
        if (location.state && location.state.comentarioId) {
            setTimeout(() => {
                const el = document.getElementById(`comentario-${location.state.comentarioId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('bg-yellow-100');
                    setTimeout(() => el.classList.remove('bg-yellow-100'), 2000);
                }
            }, 300);
        } else if (location.state && location.state.scrollToComments) {
            const el = document.getElementById('comments-section');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location, comentarios]);

    // Adicionando lógica para verificar se o usuário é colaborador ou dono
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const userId = JSON.parse(localStorage.getItem('user') || '{}').usuario_id;
                const response = await apiClient.get(`/usuario-projeto/${projectId}`);
                const collaborators = response.data;

                console.log('Colaboradores recebidos:', collaborators); // Log para debug

                // Buscar informações detalhadas de cada colaborador, incluindo o dono
                const colaboradoresDetalhados = await Promise.all(
                    collaborators.map(async (collaborator: any) => {
                        try {
                            const userRes = await apiClient.get(`/usuarios/${collaborator.usuario_id}`);
                            const isOwner = collaborator.usuario_id === projeto?.usuario_id;
                            console.log(`Usuário ${collaborator.usuario_id} - isOwner: ${isOwner}`);
                            return {
                                ...userRes.data,
                                is_owner: isOwner
                            };
                        } catch (error) {
                            console.error(`Erro ao buscar dados do usuário ${collaborator.usuario_id}:`, error);
                            return null;
                        }
                    })
                );

                // Filtrar null e definir os colaboradores
                setColaboradores(colaboradoresDetalhados.filter(Boolean));

                const isUserCollaborator = collaborators.some((collaborator: any) => collaborator.usuario_id === userId);
                setIsCollaborator(isUserCollaborator);
                console.log('Usuário é colaborador?', isUserCollaborator);

                const isUserOwner = projeto?.usuario_id === userId;
                setIsOwner(isUserOwner);
                console.log('Usuário é dono?', isUserOwner);
            } catch (error) {
                console.error('Erro ao verificar papel do usuário:', error);
            }
        };

        if (projectId) {
            checkUserRole();
        }
    }, [projectId, projeto]);

    // Usando isCollaborator e isOwner para determinar permissões
    const canEdit = useMemo(() => {
        return isOwner || isCollaborator;
    }, [isOwner, isCollaborator]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const userId = JSON.parse(localStorage.getItem('user') || '{}').usuario_id;
        if (!userId) {
            alert('Você precisa estar logado para comentar!');
            navigate('/login');
            return;
        }

        setIsSubmittingComment(true);
        try {
            await apiClient.post('/comentarios', {
                usuario_id: userId,
                projeto_id: Number(projectId),
                texto: newComment.trim()
            });

            // Recarregar comentários
            carregarComentarios();
            // Limpar o campo de comentário
            setNewComment('');
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            alert('Erro ao enviar comentário. Tente novamente.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Efeito para buscar colaboradores
    useEffect(() => {
        const fetchCollaborators = async () => {
            if (!projectId || !projeto?.usuario_id) return;

            try {
                const userId = JSON.parse(localStorage.getItem('user') || '{}').usuario_id;
                const response = await apiClient.get(`/usuario-projeto/${projectId}`);
                const collaboratorsData = response.data;

                // Buscar informações detalhadas dos usuários
                const detailedUsers = await Promise.all(
                    collaboratorsData.map(async (collab: any) => {
                        try {
                            const userRes = await apiClient.get(`/usuarios/${collab.usuario_id}`);
                            return {
                                ...userRes.data,
                                is_owner: collab.usuario_id === projeto.usuario_id
                            };
                        } catch (error) {
                            console.error(`Erro ao buscar usuário ${collab.usuario_id}:`, error);
                            return null;
                        }
                    })
                );

                // Filtrar nulos e atualizar estado
                const validUsers = detailedUsers.filter(Boolean);
                setColaboradores(validUsers);

                // Verificar papéis do usuário atual
                const isUserCollab = collaboratorsData.some((c: any) => c.usuario_id === userId);
                const isUserOwner = projeto.usuario_id === userId;

                setIsCollaborator(isUserCollab);
                setIsOwner(isUserOwner);
            } catch (error) {
                console.error('Erro ao buscar colaboradores:', error);
            }
        };

        fetchCollaborators();
    }, [projectId, projeto?.usuario_id]);

    // Buscar dados do dono do projeto (usuário) ao carregar o projeto
    useEffect(() => {
        const fetchOwnerUser = async () => {
            if (projeto?.usuario_id) {
                try {
                    const response = await apiClient.get(`/usuarios/${projeto.usuario_id}`);
                    setOwnerUser(response.data);
                } catch (error) {
                    setOwnerUser(null);
                }
            }
        };
        fetchOwnerUser();
    }, [projeto?.usuario_id]);

    // Projetos aleatórios (mock, pois não buscamos todos os projetos mais)
    const randomProjetos: Projeto[] = useMemo(() => [], []);

    // Renderização condicional robusta
    if (loading) {
        console.log('[PortfolioProjectPage] Render: loading...');
        return <p>Carregando...</p>;
    }
    if (error) {
        console.log('[PortfolioProjectPage] Render: error:', error);
        return <p>{error}</p>;
    }
    if (!projeto) {
        console.log('[PortfolioProjectPage] Render: projeto não encontrado');
        return <p>Projeto não encontrado.</p>;
    }

    // Função scrollToComments
    function scrollToComments() {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    // Função handleUploadImages
    async function handleUploadImages(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.files || !projeto) return;
        const formData = new FormData();
        for (const file of Array.from(event.target.files)) {
            formData.append('imagens', file);
        }
        try {
            await apiClient.post(`/projetos/${projeto.projeto_id}/imagens`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Atualiza as imagens do projeto
            const response = await apiClient.get(`/projetos/${projeto.projeto_id}`);
            setProjeto(response.data);
            alert('Imagens enviadas com sucesso!');
        } catch (error) {
            alert('Erro ao enviar imagens.');
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl relative bg-black border-4 border-black rounded-3xl shadow-2xl">
            {/* Coluna de Botões Funcionais */}
            <div className="absolute left-full top-16 ml-4 flex flex-col gap-2 z-20" style={{ pointerEvents: 'auto' }}>
                {/* Botão de Curtida */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleLikeToggle}
                        className={`bg-black p-2 rounded-full shadow hover:bg-gray-800 flex items-center justify-center transform transition-all duration-200 font-bold text-base font-sans ${hasLiked ? 'scale-110' : 'scale-100'}`}
                    >
                        <img
                            src={hasLiked ? "/fotos/botao-curtir-vermelho.png" : "/fotos/botao-curtir.png"}
                            alt="Curtir"
                            className="w-6 h-6"
                        />
                    </button>
                    <span className="text-center text-sm font-bold font-sans text-black">{likes || 0}</span>
                </div>
                {/* Botão de Comentários */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={scrollToComments}
                        className="bg-black p-2 rounded-full shadow hover:bg-gray-800 flex items-center justify-center transform transition-all duration-200 font-bold text-base font-sans"
                    >
                        <img src="/fotos/botao-comentarios.png" alt="Comentários" className="w-6 h-6" />
                    </button>
                    <span className="text-center text-sm font-bold font-sans text-black">{comentarios.length}</span>
                </div>
                {/* Botão de Conectar */}
                {projeto.usuario_id !== userId && !isCollaborator && !isOwner && (
                    <div className="flex flex-col items-center gap-1">
                        <button
                            className="bg-black p-2 rounded-full shadow hover:bg-gray-800 flex items-center justify-center transform transition-all duration-200 font-bold text-base font-sans"
                            title="Conectar"
                            onClick={() => setIsConnectionModalOpen(true)}
                        >
                            <img src="/fotos/botao-conecta.png" alt="Conectar" className="w-6 h-6" />
                        </button>
                        <span className="text-center text-sm font-bold font-sans text-black">Conectar</span>
                    </div>
                )}
                {/* Botão de Adicionar Colaborador */}
                {isOwner && (
                    <div className="flex flex-col items-center gap-1">
                        <button
                            className="bg-black p-2 rounded-full shadow hover:bg-gray-800 flex items-center justify-center transform transition-all duration-200 font-bold text-base font-sans"
                            title="Adicionar Colaborador"
                            onClick={() => setIsAddCollaboratorModalOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#FFD700" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                            </svg>
                        </button>
                        <span className="text-center text-sm font-bold font-sans text-black">Adicionar Colaborador</span>
                    </div>
                )}
            </div>
            {/* Cabeçalho com Dono do Projeto e Colaboradores */}
            <div className="flex flex-col md:flex-row gap-12 mb-8 items-center">
                {/* Dono do Projeto - BLOCO DESTACADO */}
                <div className="flex items-center mr-12 bg-black border-4 border-black rounded-2xl p-6 shadow-xl min-w-[380px]">
                    <img
                        src={getProjectImageUrl(ownerUser?.foto_perfil)}
                        alt={ownerUser?.nome || 'Usuário'}
                        className="w-32 h-32 rounded-full border-4 border-brand-purple object-cover cursor-pointer hover:border-brand-purple-dark transition-colors shadow-lg bg-gray-800"
                        style={{ aspectRatio: '1/1' }}
                        onClick={() => navigate(`/perfil/${projeto.usuario_id}`)}
                    />
                    <div className="flex flex-col justify-center ml-8 min-w-[220px]">
                        <h1
                            className="text-4xl font-bold cursor-pointer hover:text-brand-purple transition-colors text-white text-left leading-tight"
                            onClick={() => navigate(`/perfil/${projeto.usuario_id}`)}
                        >
                            {ownerUser?.nome || 'Usuário'}
                        </h1>
                        <span className="text-lg text-white text-left mt-2 font-nunito font-semibold">Criador do Projeto</span>
                        <span className="text-base text-white text-left mt-2 font-nunito">{ownerUser?.tipo || '-'}</span>
                    </div>
                </div>
                {/* Colaboradores */}
                {colaboradores.length > 0 && colaboradores.some(c => c.usuario_id !== projeto.usuario_id) && (
                    <div className="md:w-2/3 flex items-center justify-center flex-wrap gap-12">
                        {colaboradores
                            .filter(colaborador => colaborador.usuario_id !== projeto.usuario_id)
                            .map((colaborador: Usuario) => (
                                <div key={colaborador.usuario_id} className="flex items-center cursor-pointer" onClick={() => navigate(`/perfil/${colaborador.usuario_id}`)}>
                                    <img
                                        src={getProjectImageUrl(colaborador.foto_perfil)}
                                        alt={colaborador.nome}
                                        className="w-20 h-20 rounded-full border-4 border-brand-purple object-cover hover:border-brand-purple-dark transition-colors shadow-lg bg-gray-800"
                                        style={{ aspectRatio: '1/1' }}
                                    />
                                    <div className="flex flex-col justify-center ml-6">
                                        <span className="text-xl font-semibold text-white text-left leading-tight">{colaborador.nome}</span>
                                        <span className="text-base text-white text-left mt-1 font-nunito">Colaborador</span>
                                        <span className="text-base text-white text-left mt-1 font-nunito capitalize">{colaborador.tipo || '-'}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
            {/* Título e Descrição */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">{projeto.titulo}</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{projeto.descricao}</p>
            </div>
            {/* Galeria Principal */}
            <div className="flex flex-col gap-6 mb-8 relative">
                {(projeto.imagens || []).filter(Boolean).map((imagem: string, index: number) => (
                    imagem && (
                        <div key={index} className="relative aspect-auto group overflow-hidden rounded-lg shadow-md">
                            <img
                                src={getProjectImageUrl(imagem)}
                                alt={`${projeto.titulo} - Imagem ${index + 1}`}
                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )
                ))}
            </div>
            {/* Barra de Ações */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Todas as Imagens</h2>
                </div>
                {canEdit && (
                    <div className="flex gap-2">
                        <label
                            htmlFor="adicionar-imagens"
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Adicionar Imagens
                        </label>
                        <input
                            id="adicionar-imagens"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleUploadImages}
                        />
                        <button
                            onClick={() => navigate(`/editar-projeto/${projectId}`)}
                            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple-dark transition-colors"
                        >
                            Editar Projeto
                        </button>
                    </div>
                )}
            </div>
            {/* Grade de Imagens */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {(projeto.imagens || [projeto.imagem_capa]).filter(Boolean).map((imagem: string | undefined, index: number) => (
                    imagem && (
                        <div key={index} className="relative aspect-[4/3] group overflow-hidden rounded-lg shadow-md">
                            <img
                                src={getProjectImageUrl(imagem)}
                                alt={`${projeto.titulo} - Imagem ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )
                ))}
            </div>

            {/* Links do Projeto */}
            <div className="flex flex-wrap gap-4 mb-8">
                {projeto.link_figma && (
                    <a
                        href={projeto.link_figma}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z" fill="#1ABCFE" />
                            <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z" fill="#0ACF83" />
                            <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z" fill="#FF7262" />
                            <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z" fill="#F24E1E" />
                            <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z" fill="#A259FF" />
                        </svg>
                        Ver no Figma
                    </a>
                )}
                {projeto.link_github && (
                    <a
                        href={projeto.link_github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        {/* SVG corrigido do GitHub */}
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                        </svg>
                        Ver no GitHub
                    </a>
                )}
            </div>

            {/* Projetos Aleatórios */}
            {randomProjetos.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-indie-flower text-black text-center mb-4">Acesse também outros projetos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {randomProjetos.map((projeto: Projeto) => (
                            <a
                                key={projeto.projeto_id}
                                href={`/portfolio/${projeto.projeto_id}`}
                                className="block bg-white rounded-2xl shadow-md overflow-hidden transform transition-transform hover:scale-105 border border-gray-200"
                            >
                                <div className="w-full">
                                    <img
                                        src={getProjectImageUrl(projeto.imagem_capa)}
                                        alt={projeto.titulo}
                                        className="w-full h-32 object-cover rounded-t-2xl"
                                    />
                                </div>
                                <div className="flex flex-row bg-purple-700 items-center rounded-b-2xl">
                                    <div className="flex flex-col items-center justify-center py-3 px-4 w-1/3">
                                        <div className="flex flex-row items-center justify-center gap-2 mb-1">
                                            {projeto.participantes && projeto.participantes.length > 0 ? (
                                                projeto.participantes.map((p: { usuario_id: number; nome: string; foto_perfil: string | null; papel: string }) => (
                                                    <div key={p.usuario_id} className="flex flex-col items-center">
                                                        <img
                                                            src={getProjectImageUrl(p.foto_perfil || undefined)}
                                                            alt={p.nome}
                                                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-xs text-white">Sem participantes</span>
                                            )}
                                        </div>
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            {projeto.participantes && projeto.participantes.length > 0 && (
                                                projeto.participantes.map((p: { usuario_id: number; nome: string; foto_perfil: string | null; papel: string }) => (
                                                    <span key={p.usuario_id} className="text-xs text-white font-semibold text-center leading-tight max-w-[70px] truncate">
                                                        {p.nome}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-16 w-px bg-white opacity-40 mx-2"></div>
                                    <div className="flex flex-col justify-center w-2/3 px-4 py-3">
                                        <h3 className="text-base font-semibold text-white mb-1 truncate">
                                            {projeto.titulo}
                                        </h3>
                                        <p className="text-xs text-white font-normal truncate mb-1">
                                            {projeto.descricao}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Comentários */}
            <div id="comments-section" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Comentários</h2>

                {/* Formulário de Novo Comentário */}
                <form onSubmit={handleCommentSubmit} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escreva um comentário..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={isSubmittingComment}
                            className={`px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 justify-center ${isSubmittingComment ? 'bg-gray-400' : 'bg-brand-purple hover:bg-brand-purple-dark'}`}
                        >
                            {isSubmittingComment ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Enviar
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Lista de Comentários */}
                <div className="space-y-4">
                    {comentarios.length === 0 ? (
                        <p className="text-gray-500">Nenhum comentário ainda.</p>
                    ) : (
                        comentarios.map((comentario: Comentario) => (
                            <div
                                key={comentario.comentario_id}
                                id={`comentario-${comentario.comentario_id}`}
                                className="bg-white rounded-lg p-4 shadow flex gap-4 items-start"
                            >
                                <img
                                    src={getProjectImageUrl(comentario.usuario_foto)}
                                    alt={comentario.usuario_nome}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-purple"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">{comentario.usuario_nome}</span>
                                        <span className="text-xs text-gray-400">{new Date(comentario.data_criacao).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-line">{comentario.texto}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modais */}
            <ConnectionRequestModal
                isOpen={isConnectionModalOpen}
                onClose={() => setIsConnectionModalOpen(false)}
                recipientName={projeto.usuario_nome || 'Usuário'}
                recipientId={projeto.usuario_id || 0}
                onSend={(data: any) => {
                    // Função de envio de conexão
                    console.log('Solicitação de conexão:', data);
                }}
            />
            <AddCollaboratorModal
                isOpen={isAddCollaboratorModalOpen}
                onClose={() => setIsAddCollaboratorModalOpen(false)}
                onInvite={(user: any) => {
                    // Função de convite de colaborador (implemente conforme sua lógica)
                    console.log('Convidar colaborador:', user);
                }}
            />
        </div>
    );
};

export default PortfolioProjectPage;