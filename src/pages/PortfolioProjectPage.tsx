// [DEBUG] Arquivo PortfolioProjectPage.tsx está sendo carregado (antes dos imports)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import ConnectionRequestModal from '../components/ConnectionRequestModal';
import AddCollaboratorModal from '../components/AddCollaboratorModal';

// Tipos para o projeto, colaborador e post
interface Collaborator {
    id: string;
    name: string;
}
interface ProjectPost {
    id: string;
    title: string;
    content: string;
}
interface PortfolioProject {
    id: string;
    name: string;
    description: string;
    imagePath?: string;
    collaborators: Collaborator[];
    posts: ProjectPost[];
}

// Utilitário para obter o caminho correto da imagem
const getProjectImageUrl = (imgPath?: string) => {
    if (!imgPath) return '/fotos/default-profile.png';
    if (imgPath.startsWith('http')) return imgPath;
    // Se for só o nome do arquivo, retorna do /fotos/
    return `/fotos/${imgPath}`;
};

const PortfolioProjectPage: React.FC = () => {
    console.log('[DEBUG] PortfolioProjectPage component function is running!');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<PortfolioProject | null>(null);
    const [isOpenConnectionModal, setIsOpenConnectionModal] = useState(false);
    const [isOpenAddCollaboratorModal, setIsOpenAddCollaboratorModal] = useState(false);

    const fetchProject = async () => {
        if (!id) return;
        try {
            const response = await apiClient.get(`/projects/${id}`);
            setProject(response.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleOpenConnectionModal = () => {
        setIsOpenConnectionModal(true);
    };

    const handleCloseConnectionModal = () => {
        setIsOpenConnectionModal(false);
    };

    const handleOpenAddCollaboratorModal = () => {
        setIsOpenAddCollaboratorModal(true);
    };

    const handleCloseAddCollaboratorModal = () => {
        setIsOpenAddCollaboratorModal(false);
    };

    const handleNavigateToUser = (userId: string) => {
        navigate(`/user/${userId}`);
    };

    return (
        <div>
            {project ? (
                <div>
                    <h1>{project.name}</h1>
                    <img src={getProjectImageUrl(project.imagePath)} alt={project.name} />
                    <p>{project.description}</p>
                    <button onClick={handleOpenConnectionModal}>Solicitar Conexão</button>
                    <button onClick={handleOpenAddCollaboratorModal}>Adicionar Colaborador</button>

                    {/* Renderiza a lista de colaboradores */}
                    <h2>Colaboradores</h2>
                    <ul>
                        {project.collaborators.map((collaborator) => (
                            <li key={collaborator.id}>
                                <span onClick={() => handleNavigateToUser(collaborator.id)}>
                                    {collaborator.name}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Renderiza a lista de posts do projeto */}
                    <h2>Posts do Projeto</h2>
                    <ul>
                        {project.posts.map((post) => (
                            <li key={post.id}>
                                <h3>{post.title}</h3>
                                <p>{post.content}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Carregando projeto...</p>
            )}
            {/* Modais */}
            {project && (
                <ConnectionRequestModal
                    isOpen={isOpenConnectionModal}
                    onClose={handleCloseConnectionModal}
                    recipientName={project.name}
                    recipientId={Number(project.id)}
                    onSend={(data) => {
                        // Implemente o envio real de solicitação de conexão aqui
                        console.log('Solicitação de conexão:', data);
                    }}
                />
            )}
            {project && (
                <AddCollaboratorModal
                    isOpen={isOpenAddCollaboratorModal}
                    onClose={handleCloseAddCollaboratorModal}
                    onInvite={(user) => {
                        // Implemente o convite real de colaborador aqui
                        console.log('Convidar colaborador:', user);
                    }}
                />
            )}
        </div>
    );
};

export default PortfolioProjectPage;
