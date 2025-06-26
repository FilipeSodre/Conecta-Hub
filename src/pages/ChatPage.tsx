import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { getProjectImageUrl } from '../services/imageUtils';

const ChatPage: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatInfo, setChatInfo] = useState<any>(null);
    const userId = JSON.parse(localStorage.getItem('user') || '{}').usuario_id;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!chatId) return;
            const res = await apiClient.get(`/chats/${chatId}/messages`);
            setMessages(Array.isArray(res.data) ? res.data : []);
            // Removido scroll automático
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [chatId]);

    useEffect(() => {
        const fetchChatInfo = async () => {
            if (!chatId) return;
            const res = await apiClient.get(`/chats/${chatId}`);
            setChatInfo(res.data);
        };
        fetchChatInfo();
    }, [chatId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        console.log('Enviando mensagem:', { chatId, sender_id: userId, message: newMessage.trim() });
        await apiClient.post(`/chats/${chatId}/messages`, {
            sender_id: userId,
            message: newMessage.trim(),
        });
        setNewMessage('');
        // Atualiza imediatamente após enviar
        const res = await apiClient.get(`/chats/${chatId}/messages`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        // Removido scroll automático
    };

    // Helper para pegar info do outro usuário
    const getOtherUser = () => {
        if (!chatInfo) return { nome: '', foto: '' };
        if (Number(chatInfo.user1_id) === Number(userId)) {
            return { nome: chatInfo.user2_nome, foto: chatInfo.user2_foto };
        } else {
            return { nome: chatInfo.user1_nome, foto: chatInfo.user1_foto };
        }
    };
    const otherUser = getOtherUser();

    return (
        <div className="container mx-auto max-w-full sm:max-w-4xl h-[80vh] sm:h-[600px] my-4 sm:my-8 bg-gray-100 rounded-2xl overflow-hidden shadow-lg flex flex-col">
            <header className="bg-brand-purple text-white px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4 shadow">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img
                        src={otherUser.foto ? getProjectImageUrl(otherUser.foto) : '/default-profile.png'}
                        alt="Foto do perfil"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white"
                    />
                    <span className="text-sm sm:text-base font-semibold">
                        {otherUser.nome || 'Usuário'}
                    </span>
                </div>
            </header>
            <main className="flex-1 h-[60vh] sm:h-[500px] p-2 sm:p-4 flex flex-col">
                <div className="flex-1 flex flex-col gap-1 sm:gap-2 overflow-y-auto mb-2 sm:mb-4">
                    {(Array.isArray(messages) ? messages : []).map(msg => (
                        <div
                            key={msg.id}
                            className={`flex items-start gap-1 sm:gap-2 ${msg.sender_id === userId ? 'flex-row-reverse' : ''}`}
                        >
                            <img
                                src={msg.sender_foto ? getProjectImageUrl(msg.sender_foto) : '/default-profile.png'}
                                alt={msg.sender_nome || 'Foto do perfil'}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0"
                            />
                            <div className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs text-gray-500 mb-0.5 sm:mb-1 px-1">
                                    {msg.sender_nome}
                                </span>
                                <div
                                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-sm ${msg.sender_id === userId
                                        ? 'bg-brand-purple text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-tl-none'
                                        } text-xs sm:text-base`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="flex gap-1 sm:gap-2 mt-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="flex-1 px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent text-xs sm:text-base"
                        placeholder="Digite sua mensagem..."
                    />
                    <button
                        type="submit"
                        className="px-3 sm:px-6 py-1 sm:py-2 bg-brand-purple text-white rounded-full hover:bg-brand-purple-dark text-xs sm:text-base"
                    >
                        Enviar
                    </button>
                </form>
            </main>
        </div>
    );
};

export default ChatPage;