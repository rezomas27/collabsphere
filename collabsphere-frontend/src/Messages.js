import React, { useState, useEffect , useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const navigate = useNavigate();
    const scrollRef = useRef(null);


    useEffect(() => {
        fetchMessages();
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (searchUsername.trim().length > 0) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [searchUsername]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedConversation]);

    useEffect(() => {
        if (selectedConversation) {
            const unreadMessages = messages.filter(m => 
                !m.read && 
                m.recipient._id === currentUser?._id &&
                (m.sender._id === selectedConversation || m.recipient._id === selectedConversation)
            );
            
            unreadMessages.forEach(message => markAsRead(message._id));
        }
    }, [selectedConversation]);

    const getCurrentUser = async () => {
        try {
            const response = await fetch('/api/profile/me', {
                credentials: 'include'
            });
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData.data);
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
        }
    };

    const searchUsers = async () => {
        try {
            const response = await fetch(`/api/users/search?username=${searchUsername}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error searching users:', err);
            setUsers([]);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages', {
                credentials: 'include'
            });
            
            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            setMessages(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch messages');
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || (!selectedUser && !selectedConversation)) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipientId: selectedUser?._id || selectedConversation,
                    content: newMessage
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const message = await response.json();
            setMessages([message, ...messages]);
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            setError(err.message);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(`/api/messages/${messageId}/read`, {
                method: 'PUT',
                credentials: 'include'
            });
            fetchMessages();
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    };

    const groupMessagesByConversation = () => {
        const conversationsMap = new Map();
        
        messages.forEach(message => {
            const otherUserId = message.sender._id === currentUser?._id ? 
                message.recipient._id : message.sender._id;
            const otherUserName = message.sender._id === currentUser?._id ? 
                message.recipient.userName : message.sender.userName;
            
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    userName: otherUserName,
                    messages: []
                });
            }
            conversationsMap.get(otherUserId).messages.push(message);
        });

        return Array.from(conversationsMap.entries()).map(([userId, data]) => ({
            userId,
            userName: data.userName,
            messages: data.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            lastMessage: data.messages[0],
            unreadCount: data.messages.filter(m => 
                !m.read && m.recipient._id === currentUser?._id
            ).length
        }));
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div></div>;

    const conversations = groupMessagesByConversation();


    return (
        <div className="min-h-screen bg-gray-900">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600">
                <Header />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Conversations List */}
                    <div className="md:col-span-1 space-y-4">
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500"
                        />
                        
                        {users.length > 0 && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg">
                                {users.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setSearchUsername('');
                                            setSelectedConversation(user._id);
                                        }}
                                        className="p-3 hover:bg-gray-700 cursor-pointer text-white"
                                    >
                                        {user.userName}
                                    </div>
                                ))}
                            </div>
                        )}

                        {conversations.map(conv => (
                            <div
                                key={conv.userId}
                                onClick={() => {
                                    setSelectedConversation(conv.userId);
                                    setSelectedUser(null);
                                }}
                                className={`p-4 rounded-lg cursor-pointer ${
                                    selectedConversation === conv.userId
                                        ? 'bg-indigo-600'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">{conv.userName}</span>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm truncate mt-1">
                                    {conv.lastMessage.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Chat Area */}
                    <div className="md:col-span-2 bg-gray-800 rounded-lg p-4 flex flex-col h-[800px]">
                        {selectedConversation ? (
                            <>
                                <div className="flex-grow overflow-y-auto space-y-4 mb-4" ref={scrollRef}>
                                    {messages
                                        .filter(m => 
                                            m.sender._id === selectedConversation || 
                                            m.recipient._id === selectedConversation
                                        )
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                        .map(message => (
                                            <div
                                                key={message._id}
                                                className={`p-4 rounded-lg ${
                                                    message.sender._id === currentUser?._id
                                                        ? 'bg-indigo-600 ml-12'
                                                        : 'bg-gray-700 mr-12'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-gray-300 text-sm">
                                                        {message.sender.userName}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">
                                                        {new Date(message.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-white">{message.content}</p>
                                            </div>
                                        ))}
                                </div>

                                <form onSubmit={sendMessage} className="mt-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Select a conversation to start chatting
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;