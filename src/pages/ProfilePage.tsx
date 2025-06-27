import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';

interface Projeto {
    projeto_id: number;
    titulo: string;
    descricao: string;
    imagem_capa: string;
    usuario_id: number;
    usuario_nome?: string;
    usuario_foto?: string;
    colaboradores?: number[]; // IDs dos colaboradores
}

interface Usuario {
    usuario_id: number;
    nome: string;
    email: string;
    tipo: string;
    foto_perfil: string | null;
    descricao: string | null;
    github?: string;
    google_drive?: string;
}

interface Notificacao {
    notificacao_id: number;
    tipo: 'curtida' | 'comentario' | 'convite_colaborador' | 'conexao';
    usuario_nome: string;
    usuario_foto: string;
    usuario_origem_id: number;
    projeto_titulo: string;
    projeto_id: number;
    comentario_texto?: string;
    comentario_id?: number;
    vaga_titulo?: string; // Título da vaga de onde veio a notificação
    mensagem?: string; // Mensagem enviada na conexão
    reason?: string; // fallback para mensagem
    tipo_conexao?: string; // Tipo de conexão selecionado no modal (ex: "Trocar ideias / Mentoria")
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('portfolio');
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [newDesc, setNewDesc] = useState('');
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [chats, setChats] = useState<any[]>([]);
    const userId = JSON.parse(localStorage.getItem('user') || '{}').usuario_id;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get(`/usuarios/${userId}`);
                setUsuario(response.data);
                setNewDesc(response.data.descricao || '');
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };

        const fetchProjetos = async () => {
            try {
                const response = await apiClient.get('/projetos');
                // Inclui projetos que o usuário é dono OU colaborador
                const projetosDoUsuario = response.data.filter(
                    (projeto: Projeto) => projeto.usuario_id === userId || (projeto.colaboradores && projeto.colaboradores.includes(userId))
                );
                setProjetos(projetosDoUsuario);
            } catch (error) {
                console.error('Erro ao buscar projetos:', error);
            }
        };

        if (userId) {
            fetchUserData();
            fetchProjetos();
        } else {
            navigate('/login');
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (userId && activeTab === 'conexoes') {
            apiClient.get(`/usuarios/${userId}/notificacoes`).then(res => {
                setNotificacoes(res.data);
            });
            apiClient.get(`/chats/user/${userId}`).then(res => {
                setChats(res.data);
            });
        }
    }, [userId, activeTab]);

    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto_perfil', file);

        try {
            await apiClient.put(`/usuarios/${userId}/foto`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Recarregar os dados do usuário
            const response = await apiClient.get(`/usuarios/${userId}`);
            setUsuario(response.data);
            setIsEditingPhoto(false);
        } catch (error) {
            console.error('Erro ao atualizar foto:', error);
            alert('Erro ao atualizar foto. Tente novamente.');
        }
    };

    const handleDescriptionUpdate = async () => {
        try {
            await apiClient.put(`/usuarios/${userId}/descricao`, { descricao: newDesc });
            setUsuario(prev => prev ? { ...prev, descricao: newDesc } : null);
            setIsEditingDesc(false);
        } catch (error) {
            console.error('Erro ao atualizar descrição:', error);
            alert('Erro ao atualizar descrição. Tente novamente.');
        }
    };

    // Handlers para aceitar/recusar convite
    const handleAceitarConvite = async (notificacaoId: number) => {
        try {
            await apiClient.post(`/notificacoes/${notificacaoId}/aceitar-convite`);
            setNotificacoes(prev => prev.filter(n => n.notificacao_id !== notificacaoId));
            alert('Convite aceito! Agora você é colaborador do projeto.');
        } catch (err) {
            alert('Erro ao aceitar convite.');
        }
    };
    const handleRecusarConvite = async (notificacaoId: number) => {
        try {
            await apiClient.post(`/notificacoes/${notificacaoId}/recusar-convite`);
            setNotificacoes(prev => prev.filter(n => n.notificacao_id !== notificacaoId));
            alert('Convite recusado.');
        } catch (err) {
            alert('Erro ao recusar convite.');
        }
    };
    const handleVisto = async (id: number) => {
        try {
            await apiClient.delete(`/notificacoes/${id}`);
            setNotificacoes(prev => prev.filter(n => n.notificacao_id !== id));
        } catch (e) {
            alert('Erro ao remover notificação');
        }
    };

    // Filtro para remover notificações duplicadas de conexão de vaga e ignorar notificações antigas de vaga sem vaga_titulo
    const notificacoesUnicas = notificacoes.filter((notif, idx, arr) => {
        if (notif.tipo === 'conexao' && notif.vaga_titulo) {
            // Só mantém a notificação de vaga mais recente por usuário e vaga
            return arr.findIndex(n => n.tipo === 'conexao' && n.vaga_titulo === notif.vaga_titulo && n.usuario_origem_id === notif.usuario_origem_id) === idx;
        }
        if (notif.tipo === 'conexao' && !notif.vaga_titulo && notif.mensagem === 'vaga') {
            // Ignora notificações antigas de vaga sem vaga_titulo
            return false;
        }
        return notif.tipo !== 'conexao' || arr.findIndex(n => n.tipo === 'conexao' && n.vaga_titulo === notif.vaga_titulo && n.usuario_origem_id === notif.usuario_origem_id) === idx;
    });

    const renderNotificacoesRoxas = () => (
        <div className="space-y-3">
            {notificacoesUnicas.length > 0 ? (
                notificacoesUnicas.map((notif) => {
                    let mensagem = null;
                    let showAcoes = false;
                    if (notif.tipo === 'convite_colaborador') {
                        mensagem = (
                            <span>
                                <span className="font-semibold">@{notif.usuario_nome}</span> está mandando um convite para você virar colaborador para o projeto <span className="font-semibold">{notif.projeto_titulo}</span>.
                            </span>
                        );
                        showAcoes = true;
                    } else if (notif.tipo === 'conexao') {
                        if (notif.vaga_titulo) {
                            mensagem = (
                                <span>
                                    <span className="font-semibold">@{notif.usuario_nome}</span> quer se conectar a vaga <span className="font-semibold">{notif.vaga_titulo}</span>.
                                </span>
                            );
                            showAcoes = false;
                        } else if (notif.tipo_conexao || notif.mensagem || notif.reason) {
                            mensagem = (
                                <span>
                                    <span className="font-semibold">@{notif.usuario_nome}</span> está mandando um convite para se conectar - <span className="font-semibold">{notif.tipo_conexao || notif.mensagem || notif.reason}</span>
                                </span>
                            );
                            showAcoes = true;
                        } else if (notif.projeto_titulo) {
                            mensagem = (
                                <span>
                                    <span className="font-semibold">@{notif.usuario_nome}</span> está mandando um convite para se conectar ao projeto <span className="font-semibold">{notif.projeto_titulo}</span>.
                                </span>
                            );
                            showAcoes = true;
                        } else {
                            mensagem = (
                                <span>
                                    <span className="font-semibold">@{notif.usuario_nome}</span> está mandando um convite de conexão.
                                </span>
                            );
                            showAcoes = true;
                        }
                    } else if (notif.tipo === 'curtida') {
                        mensagem = (
                            <span>curtiu seu projeto - <span className="font-semibold">{notif.projeto_titulo}</span></span>
                        );
                    } else if (notif.tipo === 'comentario') {
                        mensagem = (
                            <>
                                <span>comentou seu projeto - <span className="font-semibold">{notif.projeto_titulo}</span></span>
                                <div className="text-xs text-gray-700 mt-1 italic">"{notif.comentario_texto}"</div>
                            </>
                        );
                    }
                    return (
                        <div key={notif.notificacao_id} className="bg-purple-300 rounded-2xl p-3 flex items-center gap-3">
                            <Link to={`/perfil/${notif.usuario_origem_id}`} className="flex items-center gap-3">
                                <img
                                    src={getUserImageUrl(notif.usuario_foto)}
                                    alt={notif.usuario_nome}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            </Link>
                            <div className="flex-1">
                                {mensagem}
                                {notif.projeto_titulo && notif.tipo === 'convite_colaborador' && (
                                    <div className="text-xs text-blue-700 mt-1">
                                        Projeto: <span className="font-medium">{notif.projeto_titulo}</span>
                                    </div>
                                )}
                                {notif.tipo === 'conexao' && notif.projeto_titulo && notif.vaga_titulo && (
                                    <div className="text-xs text-blue-700 mt-1">
                                        Portfólio escolhido: <span className="font-medium">{notif.projeto_titulo}</span>
                                    </div>
                                )}
                                {/* Removido motivo duplicado para conexões comuns */}
                                {/* Botões de ação apenas para convite_colaborador e conexões comuns, não para vaga */}
                                {showAcoes && (
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleAceitarConvite(notif.notificacao_id)}
                                            className="px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                                        >
                                            Aceitar
                                        </button>
                                        <button
                                            onClick={() => handleRecusarConvite(notif.notificacao_id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                        >
                                            Recusar
                                        </button>
                                    </div>
                                )}
                                {/* Botão de visto para notificação de vaga */}
                                {notif.tipo === 'conexao' && notif.vaga_titulo && (
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleVisto(notif.notificacao_id)}
                                            className="px-3 py-1 bg-gray-400 text-white rounded-full text-xs hover:bg-gray-500"
                                        >
                                            Visto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-gray-500">Nenhuma notificação encontrada.</div>
            )}
        </div>
    );

    const renderMiniChatList = () => (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
            <h3 className="text-lg font-bold mb-3 text-brand-purple">Suas Conversas</h3>
            {chats.length > 0 ? (
                <ul className="space-y-2">
                    {chats.map(chat => {
                        const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
                        const otherUserName = chat.user1_id === userId ? chat.user2_nome : chat.user1_nome;
                        const otherUserFoto = chat.user1_id === userId ? chat.user2_foto : chat.user1_foto;
                        return (
                            <li key={chat.id} className="flex items-center gap-3 cursor-pointer hover:bg-purple-50 rounded-lg p-2" onClick={() => navigate(`/chat/${chat.id}`)}>
                                <img src={getUserImageUrl(otherUserFoto)} alt={otherUserName} className="w-8 h-8 rounded-full object-cover" />
                                <span className="font-medium text-brand-purple-dark">{otherUserName || `Usuário ${otherUserId}`}</span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-gray-500 text-sm">Nenhuma conversa ainda.</div>
            )}
        </div>
    );

    // Corrige exibição de imagens de perfil e chat para nunca usar localhost, apenas Cloudinary ou placeholder
    const getUserImageUrl = (foto_perfil?: string | null) => {
        if (!foto_perfil) return '/default-profile.png';
        if (foto_perfil.startsWith('http')) return foto_perfil;
        return '/default-profile.png';
    };

    const getProjectImageUrl = (imgPath?: string) => {
        if (!imgPath) return '/default-profile.png';
        if (imgPath.startsWith('http')) return imgPath;
        return '/default-profile.png';
    };

    if (!usuario) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="container mx-auto p-2 sm:p-4 max-w-6xl">
            {/* Cabeçalho do Perfil */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 mb-8">
                {/* Foto de Perfil */}
                <div className="relative flex-shrink-0">
                    <img
                        src={getUserImageUrl(usuario.foto_perfil)}
                        alt={usuario.nome}
                        className="w-28 h-28 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-brand-purple"
                    />
                    <button
                        onClick={() => setIsEditingPhoto(true)}
                        className="absolute bottom-2 right-2 bg-brand-purple text-white p-2 rounded-full hover:bg-brand-purple-dark"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    {isEditingPhoto && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="foto-perfil"
                        />
                    )}
                </div>

                {/* Informações do Usuário */}
                <div className="flex-1 w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{usuario.nome}</h1>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        {usuario.tipo === 'designer' ? 'Designer' :
                            usuario.tipo === 'programador' ? 'Programador(a)' :
                                'Empresário(a)'}
                    </p>

                    {isEditingDesc ? (
                        <div className="mb-4">
                            <textarea
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent text-sm"
                                rows={3}
                                placeholder="Escreva uma descrição sobre você..."
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleDescriptionUpdate}
                                    className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple-dark text-sm"
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingDesc(false);
                                        setNewDesc(usuario.descricao || '');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative mb-4">
                            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
                                {usuario.descricao || 'Nenhuma descrição adicionada.'}
                            </p>
                            <button
                                onClick={() => setIsEditingDesc(true)}
                                className="absolute top-0 right-0 text-brand-purple hover:text-brand-purple-dark"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-4 mt-2">
                        {usuario.github && (
                            <a
                                href={usuario.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0117.548 0c9.301-6.356 13.301-6.356 13.301-6.356 2.67 6.763.973 11.816.486 13.038 3.075 3.422 5.014 7.822 5.014 13.2 0 18.905-11.404 23.142-22.243 24.283a8.992 8.992 0 013.074 6.6c2.831 1.304 9.868 3.422 14.235-4.074 0 0 2.589-4.726 7.523-5.052z" />
                                </svg>
                            </a>
                        )}
                        {/* ...outros links... */}
                    </div>
                </div>
            </div>

            {/* Abas do perfil */}
            <div className="mt-4 sm:mt-8">
                <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-brand-purple/40 scrollbar-track-transparent">
                    <button
                        className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-2xl font-semibold text-sm sm:text-base transition-colors duration-200 ${activeTab === 'portfolio' ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setActiveTab('portfolio')}
                    >
                        Portfólio
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-2xl font-semibold text-sm sm:text-base transition-colors duration-200 ${activeTab === 'salvos' ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setActiveTab('salvos')}
                    >
                        Salvos
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-2xl font-semibold text-sm sm:text-base transition-colors duration-200 ${activeTab === 'conexoes' ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setActiveTab('conexoes')}
                    >
                        Conexões
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-2xl font-semibold text-sm sm:text-base transition-colors duration-200 ${activeTab === 'conquistas' ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setActiveTab('conquistas')}
                    >
                        Conquistas
                    </button>
                </div>
                {activeTab === 'portfolio' && (
                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-brand-purple/40 scrollbar-track-transparent">
                        {/* Renderização dos projetos do usuário */}
                        {projetos.map(projeto => (
                            <div key={projeto.projeto_id} className="min-w-[260px] sm:min-w-0 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/portfolio/${projeto.projeto_id}`)}>
                                <img src={getProjectImageUrl(projeto.imagem_capa)} alt={projeto.titulo} className="w-full h-32 sm:h-40 object-cover" />
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 truncate">{projeto.titulo}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{projeto.descricao}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'salvos' && (
                    <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
                        Funcionalidade em desenvolvimento
                    </div>
                )}
                {activeTab === 'conexoes' && (
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
                        <div className="md:w-1/3">{renderMiniChatList()}</div>
                        <div className="flex-1">
                            {renderNotificacoesRoxas()}
                        </div>
                    </div>
                )}
                {activeTab === 'conquistas' && (
                    <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
                        Funcionalidade em desenvolvimento
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;