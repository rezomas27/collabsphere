import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [messageSearch, setMessageSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const { userId } = useParams();
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [lastMessageId, setLastMessageId] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const messagesPerPage = 20;
    const [wsStatus, setWsStatus] = useState('disconnected');
    const messageQueue = useRef([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [syncInterval, setSyncInterval] = useState(null);
    const [connectionRetries, setConnectionRetries] = useState(0);
    const [messageDeliveryStatus, setMessageDeliveryStatus] = useState({});
    const [attemptingReconnect, setAttemptingReconnect] = useState(false);

    useEffect(() => {
        fetchMessages();
        getCurrentUser();
        let ws = null;
        let reconnectTimeout = null;

        const connectWebSocket = () => {
            if (socket?.readyState === WebSocket.OPEN) return;
            
            console.log(`Attempting to connect to WebSocket (attempt ${connectionRetries + 1})`);
            setAttemptingReconnect(true);
            
            const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws';
            const ws = new WebSocket(wsUrl);
            
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.log('WebSocket connection timeout');
                    ws.close();
                    setWsStatus('error');
                    setAttemptingReconnect(false);
                    
                    // Retry with increasing delay up to 30 seconds
                    const retryDelay = Math.min(5000 * Math.pow(1.5, connectionRetries), 30000);
                    console.log(`Will retry in ${retryDelay/1000} seconds`);
                    
                    setTimeout(() => {
                        if (connectionRetries < 10) {  // Limit retry attempts
                            setConnectionRetries(prev => prev + 1);
                            connectWebSocket();
                        }
                    }, retryDelay);
                }
            }, 10000); // 10 second connection timeout
            
            ws.onopen = () => {
                console.log('WebSocket connected successfully!');
                clearTimeout(connectionTimeout);
                setWsStatus('connected');
                setConnectionRetries(0);
                setAttemptingReconnect(false);
                
                if (currentUser?._id) {
                    ws.send(JSON.stringify({ 
                        type: 'auth', 
                        userId: currentUser._id,
                        timestamp: Date.now()
                    }));
                }
                
                // Send any queued messages
                while (messageQueue.current.length > 0) {
                    const message = messageQueue.current.shift();
                    ws.send(JSON.stringify({
                        ...message,
                        timestamp: Date.now()
                    }));
                }
                
                // If we have a selected conversation, trigger a sync
                if (selectedConversation) {
                    syncConversationMessages(selectedConversation);
                }
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data);
                    
                    // Reset connection retry counter on successful message
                    setConnectionRetries(0);
                    
                    if (data.type === 'new_message') {
                        // Acknowledge receipt
                        ws.send(JSON.stringify({
                            type: 'message_received',
                            messageId: data.messageId || data.message?._id,
                            userId: data.message?.sender?._id,
                            timestamp: Date.now()
                        }));
                        
                        // Add message if not already present
                        setMessages(prev => {
                            if (prev.some(m => m._id === data.message._id)) {
                                return prev;
                            }
                            return [data.message, ...prev];
                        });
                        
                        // Play notification sound for new messages
                        if (data.message?.sender?._id !== currentUser?._id) {
                            try {
                                const audio = new Audio('/notification.mp3');
                                audio.play().catch(e => console.log('Audio play failed:', e));
                            } catch (audioError) {
                                console.log('Audio playback error:', audioError);
                            }
                        }
                    } else if (data.type === 'typing') {
                        setIsTyping(data.isTyping);
                    } else if (data.type === 'message_read') {
                        setMessages(prev => 
                            prev.map(msg => 
                                msg._id === data.messageId 
                                    ? { ...msg, read: true, readAt: data.timestamp || new Date() }
                                    : msg
                            )
                        );
                    } else if (data.type === 'message_delivered') {
                        // Update delivery status
                        setMessageDeliveryStatus(prev => ({
                            ...prev,
                            [data.messageId]: {
                                status: 'delivered',
                                timestamp: data.timestamp || new Date()
                            }
                        }));
                        
                        // Also update the message in state
                        setMessages(prev => 
                            prev.map(msg => 
                                msg._id === data.messageId 
                                    ? { ...msg, delivered: true, deliveredAt: data.timestamp || new Date() }
                                    : msg
                            )
                        );
                    } else if (data.type === 'auth_success') {
                        console.log('Authentication successful');
                        
                        // If we have a selected conversation, trigger a sync
                        if (selectedConversation) {
                            syncConversationMessages(selectedConversation);
                        }
                    } else if (data.type === 'user_status') {
                        // Handle online/offline status updates
                        console.log(`User ${data.userId} is now ${data.status}`);
                        // Here you could update UI to show user status
                    } else if (data.type === 'error') {
                        console.error('WebSocket error:', data.message);
                        showToast(data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };
            
            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                clearTimeout(connectionTimeout);
                setWsStatus('disconnected');
                setAttemptingReconnect(false);
                
                // Don't attempt reconnect if closure was clean and intentional
                const isCleanClosure = event.code === 1000 || event.code === 1001;
                if (!isCleanClosure) {
                    // Retry with increasing delay up to 30 seconds
                    const retryDelay = Math.min(5000 * Math.pow(1.5, connectionRetries), 30000);
                    console.log(`Will retry in ${retryDelay/1000} seconds`);
                    
                    setTimeout(() => {
                        if (connectionRetries < 10) {  // Limit retry attempts
                            setConnectionRetries(prev => prev + 1);
                            connectWebSocket();
                        }
                    }, retryDelay);
                }
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                clearTimeout(connectionTimeout);
                setWsStatus('error');
                setAttemptingReconnect(false);
            };
            
            setSocket(ws);
        };

        if (currentUser?._id) {
            connectWebSocket();
        }

        return () => {
            if (ws) {
                ws.close();
                console.log('WebSocket connection closed');
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [currentUser?._id]);

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
            console.log('Selected conversation changed to:', selectedConversation);
            
            // Mark unread messages as read
            const unreadMessages = messages.filter(m => 
                !m.read && 
                m.recipient._id === currentUser?._id &&
                (m.sender._id === selectedConversation || m.recipient._id === selectedConversation)
            );
            
            unreadMessages.forEach(message => markAsRead(message._id));
            
            // Scroll to bottom of messages
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [selectedConversation, currentUser?._id]);

    useEffect(() => {
        if (userId) {
            console.log('URL param userId changed to:', userId);
            setSelectedConversation(userId);
            setSelectedUser(null);
            
            // Force conversation selection after a short delay
            setTimeout(() => {
                if (!selectedConversation) {
                    console.log('Forcing conversation selection to:', userId);
                    setSelectedConversation(userId);
                }
            }, 200);
        }
    }, [userId]);

    useEffect(() => {
        if (messageSearch.trim().length > 0 && selectedConversation) {
            searchConversationMessages();
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    }, [messageSearch]);

    useEffect(() => {
        // Set up regular sync interval when a conversation is selected
        if (selectedConversation) {
            console.log('Setting up sync interval for conversation:', selectedConversation);
            
            // Immediate first sync
            syncConversationMessages(selectedConversation);
            
            // Set up interval for future syncs (every 10 seconds)
            const interval = setInterval(() => {
                syncConversationMessages(selectedConversation);
            }, 10000);
            
            setSyncInterval(interval);
            
            return () => {
                clearInterval(interval);
            };
        }
    }, [selectedConversation]);

    const syncConversationMessages = async (userId) => {
        if (!userId) return;
        
        try {
            console.log('Syncing messages for conversation:', userId);
            
            // If connected to WebSocket, send sync request
            if (wsStatus === 'connected' && socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'sync_request',
                    conversationWith: userId,
                    lastSyncTime
                }));
            }
            
            // Always fetch from API for reliability
            const url = new URL(`http://localhost:3000/api/messages/sync`, window.location.origin);
            url.searchParams.append('conversationWith', userId);
            if (lastSyncTime) {
                url.searchParams.append('lastSyncTime', lastSyncTime);
            }
            
            const response = await fetch(url, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to sync messages');
            }
            
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                console.log(`Synced ${data.messages.length} messages, undelivered: ${data.undeliveredCount}`);
                
                // Merge with existing messages without duplicates
                setMessages(prev => {
                    // Create a map of existing messages by ID
                    const existingMsgs = new Map();
                    prev.forEach(msg => existingMsgs.set(msg._id, msg));
                    
                    // Add new messages if they don't exist
                    data.messages.forEach(msg => {
                        if (!existingMsgs.has(msg._id)) {
                            existingMsgs.set(msg._id, msg);
                        }
                    });
                    
                    // Convert map back to array and sort
                    return Array.from(existingMsgs.values())
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                });
            }
            
            // Update last sync time
            setLastSyncTime(data.syncTime);
            
        } catch (err) {
            console.error('Error syncing messages:', err);
        }
    };

    const getCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch user profile');
            }
            
            const userData = await response.json();
            if (userData?.data) {
                setCurrentUser(userData.data);
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            setError(err.message || 'Failed to fetch user profile');
        }
    };

    const searchUsers = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/search?username=${searchUsername}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error searching users:', err);
            setUsers([]);
        }
    };

    const searchConversationMessages = () => {
        if (!messageSearch.trim()) return;
        
        const searchTerm = messageSearch.toLowerCase();
        const results = messages.filter(msg => 
            (msg.sender._id === selectedConversation || msg.recipient._id === selectedConversation) &&
            msg.content.toLowerCase().includes(searchTerm)
        );
        
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/messages', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid messages data received');
            }
            
            setMessages(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Failed to fetch messages');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || (!selectedUser && !selectedConversation)) return;
        
        setSendingMessage(true);
        const tempId = `temp-${Date.now()}`; // Create temporary ID for UI
        
        const messageData = {
            recipientId: selectedUser?._id || selectedConversation,
            content: newMessage,
            tempId // Include temp ID
        };
        
        // Add message to UI optimistically with pending status
        const optimisticMessage = {
            _id: tempId,
            content: newMessage,
            sender: {
                _id: currentUser._id,
                userName: currentUser.userName
            },
            recipient: {
                _id: selectedUser?._id || selectedConversation,
                userName: selectedUser?.userName || 
                    conversations.find(c => c.userId === selectedConversation)?.userName || 'User'
            },
            createdAt: new Date().toISOString(),
            read: false,
            delivered: false,
            pending: true
        };
        
        setMessages(prev => [optimisticMessage, ...prev]);
        setNewMessage('');
        
        try {
            // Send via WebSocket if connected
            if (wsStatus === 'connected' && socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'new_message',
                    ...messageData,
                    timestamp: Date.now()
                }));
            } else {
                // Queue for later sending
                messageQueue.current.push({
                    type: 'new_message',
                    ...messageData
                });
            }
            
            // Always send via API for reliability
            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(messageData)
            });
            
            if (!response.ok) throw new Error('Failed to send message');
            
            const message = await response.json();
            
            // Replace optimistic message with real message
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === tempId ? message : msg
                )
            );
            
            // Track delivery status
            setMessageDeliveryStatus(prev => ({
                ...prev,
                [message._id]: {
                    status: message.delivered ? 'delivered' : 'sent',
                    timestamp: new Date()
                }
            }));
            
            // Scroll to bottom after sending
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        } catch (err) {
            console.error('Error sending message:', err);
            
            // Mark optimistic message as failed
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === tempId ? { ...msg, error: true, pending: false } : msg
                )
            );
            
            showToast('Failed to send message. Please try again.', 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(`http://localhost:3000/api/messages/${messageId}/read`, {
                method: 'PUT',
                credentials: 'include'
            });
            
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === messageId 
                        ? { ...msg, read: true }
                        : msg
                )
            );
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    };

    const groupMessagesByConversation = () => {
        const conversationsMap = new Map();
        
        messages.forEach(message => {
            if (!message.sender || !message.recipient) return;

            const currentUserId = currentUser?._id;
            const otherUserId = message.sender._id === currentUserId ? 
                message.recipient._id : message.sender._id;
            const otherUserName = message.sender._id === currentUserId ? 
                message.recipient.userName || 'Deleted User' : 
                message.sender.userName || 'Deleted User';

            // Create a consistent conversation key by sorting the IDs
            const ids = [currentUserId, otherUserId].sort();
            const conversationKey = ids.join('_');
            
            if (!conversationsMap.has(conversationKey)) {
                conversationsMap.set(conversationKey, {
                    userId: otherUserId,
                    userName: otherUserName,
                    messages: []
                });
            }
            conversationsMap.get(conversationKey).messages.push(message);
        });

        return Array.from(conversationsMap.values())
            .map(conv => ({
                userId: conv.userId,
                userName: conv.userName,
                messages: conv.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                lastMessage: conv.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0],
                unreadCount: conv.messages.filter(m => 
                    !m.read && 
                    m.recipient._id === currentUser?._id
                ).length
            }))
            .filter(conv => conv.userId && conv.messages.length > 0)
            .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
    };

    const handleTyping = () => {
        if (!selectedConversation) return;

        const message = {
            type: 'typing',
            recipientId: selectedConversation,
            isTyping: true
        };

        if (wsStatus === 'connected' && socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            messageQueue.current.push(message);
        }

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const timeout = setTimeout(() => {
            const stopTypingMessage = {
                type: 'typing',
                recipientId: selectedConversation,
                isTyping: false
            };

            if (wsStatus === 'connected' && socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(stopTypingMessage));
            } else {
                messageQueue.current.push(stopTypingMessage);
            }
        }, 3000);

        setTypingTimeout(timeout);
    };

    const loadMoreMessages = async () => {
        if (!selectedConversation || isLoadingMore || !hasMoreMessages) return;

        setIsLoadingMore(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/messages/${selectedConversation}?before=${lastMessageId}&limit=${messagesPerPage}`,
                { credentials: 'include' }
            );
            
            if (!response.ok) throw new Error('Failed to fetch more messages');
            
            const newMessages = await response.json();
            if (newMessages.length < messagesPerPage) {
                setHasMoreMessages(false);
            }
            
            setMessages(prev => [...prev, ...newMessages]);
            if (newMessages.length > 0) {
                setLastMessageId(newMessages[newMessages.length - 1]._id);
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
            showToast('Failed to load more messages', 'error');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleMessageInput = (e) => {
        setNewMessage(e.target.value);
        handleTyping();
    };

    const deleteConversation = async (userId) => {
        setShowDeleteModal(true);
        setConversationToDelete(userId);
    };

    const confirmDeleteConversation = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/messages/conversation/${conversationToDelete}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete conversation');
            }

            // Remove all messages from this conversation
            setMessages(prev => prev.filter(message => 
                !(message.sender._id === conversationToDelete || message.recipient._id === conversationToDelete)
            ));

            // If this was the selected conversation, clear it
            if (selectedConversation === conversationToDelete) {
                setSelectedConversation(null);
                setSelectedUser(null);
            }

            showToast('Conversation deleted successfully', 'success');

        } catch (err) {
            console.error('Error deleting conversation:', err);
            setError(err.message);
            showToast('Failed to delete conversation', 'error');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setConversationToDelete(null);
        }
    };

    const showToast = (message, type = 'info') => {
        // This is a placeholder for a toast notification system
        // In a real application, you would use a toast library like react-toastify
        console.log(`Toast (${type}): ${message}`);
        // Here you would trigger a toast notification
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            // Today, show time only
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            // Yesterday
            return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            // Older, show date
            return date.toLocaleDateString([], { day: 'numeric', month: 'short' }) + 
                   ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    if (loading && !messages.length) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-600 border-t-transparent"></div>
        </div>
    );

    const conversations = groupMessagesByConversation();

    const renderMessage = (message) => (
        <div
            key={message._id}
            className={`p-4 rounded-lg my-2 flex flex-col relative ${
                message.sender._id === currentUser?._id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 ml-12 shadow-md'
                    : 'bg-slate-800/60 mr-12 shadow-md'
            } group ${message.error ? 'border border-red-500' : ''} ${message.pending ? 'opacity-70' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-300 text-sm">
                    {message.sender.userName || 'Deleted User'}
                </span>
                <span className="text-gray-400 text-xs">
                    {formatMessageTime(message.createdAt)}
                </span>
            </div>
            <p className="text-white">{message.content}</p>
            
            {message.sender._id === currentUser?._id && (
                <div className="text-right mt-1 flex items-center justify-end space-x-1">
                    {message.pending && (
                        <span className="text-xs text-gray-300 italic flex items-center">
                            <svg className="animate-spin mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                        </span>
                    )}
                    {message.error && (
                        <span className="text-xs text-red-300 flex items-center">
                            <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Failed
                            <button 
                                onClick={() => resendMessage(message)} 
                                className="ml-2 text-cyan-200 hover:text-white underline"
                            >
                                Retry
                            </button>
                        </span>
                    )}
                    {!message.pending && !message.error && message.delivered && !message.read && (
                        <span className="text-xs text-cyan-200">Delivered</span>
                    )}
                    {message.read && (
                        <span className="text-xs text-cyan-200">Read</span>
                    )}
                </div>
            )}
        </div>
    );

    const renderConnectionStatus = () => {
        if (wsStatus === 'connected') {
            return null; // Don't show when connected
        }
        
        return (
            <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg ${
                wsStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } text-white text-sm flex items-center gap-2 shadow-lg z-50`}>
                {wsStatus === 'error' ? (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Connection error</span>
                        <button 
                            onClick={() => {
                                if (socket) {
                                    socket.close();
                                }
                                setWsStatus('disconnected');
                                setConnectionRetries(0);
                                connectWebSocket();
                            }}
                            className="underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : attemptingReconnect ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Reconnecting... (Attempt {connectionRetries + 1})</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Connection lost, reconnecting...</span>
                    </div>
                )}
            </div>
        );
    };


    

    const resendMessage = (message) => {
        // Create a new message with the same content
        setNewMessage(message.content);
        
        // Remove the failed message
        setMessages(prev => prev.filter(m => m._id !== message._id));
        
        // Focus the input field
        document.querySelector('input[type="text"]').focus();
    };

    return (
        <div className="min-h-screen bg-slate-900">
            
            {/* Background gradient blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-600 opacity-20 blur-3xl"></div>
                <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
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
                            className="w-full p-3 rounded-lg bg-blue-900/30 backdrop-blur-sm text-white border border-blue-700/50 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                        
                        {users.length > 0 && (
                            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/50 rounded-lg">
                                {users.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setSearchUsername('');
                                            setSelectedConversation(user._id);
                                        }}
                                        className="p-3 hover:bg-blue-800/40 cursor-pointer text-white"
                                    >
                                        {user.userName}
                                    </div>
                                ))}
                            </div>
                        )}

                        {conversations.length > 0 ? (
                            conversations.map(conv => (
                                <div
                                    key={conv.userId}
                                    className={`p-4 rounded-lg cursor-pointer transition-all relative group ${
                                        selectedConversation === conv.userId
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg'
                                            : 'bg-blue-900/30 backdrop-blur-sm hover:bg-blue-800/40 border border-blue-700/50'
                                    }`}
                                    onClick={() => {
                                        console.log('Setting conversation to:', conv.userId);
                                        setSelectedConversation(conv.userId);
                                        setSelectedUser(null);
                                        setMessageSearch('');
                                        setShowSearchResults(false);
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-medium">{conv.userName}</span>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-yellow-500 text-slate-900 px-2 py-1 rounded-full text-xs">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm truncate mt-1">
                                        {conv.lastMessage.content}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {formatMessageTime(conv.lastMessage.createdAt)}
                                    </p>
                                    
                                    {/* Enhanced Delete button - more visible */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the parent onClick from firing
                                            deleteConversation(conv.userId);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full 
                                                 bg-red-500/0 hover:bg-red-500 
                                                 text-white opacity-0 group-hover:opacity-100
                                                 transition-all duration-200 border border-red-500 z-10"
                                        title="Delete conversation"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-6 text-center border border-blue-700/50">
                                <svg className="w-12 h-12 mx-auto text-cyan-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-gray-300">No conversations yet</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Search for users to start a conversation
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="md:col-span-2 bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 flex flex-col h-[800px] border border-blue-700/50">
                        {selectedConversation ? (
                            <>
                                {/* Chat header with search */}
                                <div className="flex justify-between items-center mb-4 border-b border-blue-700/50 pb-3">
                                    <h3 className="text-lg font-medium text-white">
                                        {conversations.find(c => c.userId === selectedConversation)?.userName || 'Chat'}
                                    </h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search in conversation..."
                                            value={messageSearch}
                                            onChange={(e) => setMessageSearch(e.target.value)}
                                            className="p-2 rounded-lg bg-slate-800/70 text-white border border-blue-700/50 text-sm w-56"
                                        />
                                        {messageSearch && (
                                            <button 
                                                onClick={() => {
                                                    setMessageSearch('');
                                                    setShowSearchResults(false);
                                                }}
                                                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Search results */}
                                {showSearchResults && (
                                    <div className="mb-4 p-3 bg-blue-800/40 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white">Search Results: {searchResults.length}</span>
                                            <button 
                                                onClick={() => setShowSearchResults(false)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                            {searchResults.map(message => (
                                                <div 
                                                    key={message._id}
                                                    className="p-2 hover:bg-blue-700/40 rounded cursor-pointer text-sm text-gray-200"
                                                    onClick={() => {
                                                        const msgElement = document.getElementById(`msg-${message._id}`);
                                                        if (msgElement) {
                                                            msgElement.scrollIntoView({ behavior: 'smooth' });
                                                            setTimeout(() => {
                                                                msgElement.classList.add('highlight-message');
                                                                setTimeout(() => msgElement.classList.remove('highlight-message'), 2000);
                                                            }, 300);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex justify-between">
                                                        <span>{message.sender.userName}: </span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatMessageTime(message.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="truncate">{message.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-4" ref={scrollRef}>
                                    {selectedConversation ? (
                                        messages
                                            .filter(m => 
                                                (m.sender?._id === selectedConversation || 
                                                m.recipient?._id === selectedConversation) &&
                                                (m.sender?._id === currentUser?._id || 
                                                m.recipient?._id === currentUser?._id)
                                            )
                                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                            .map(message => (
                                                <div id={`msg-${message._id}`} key={message._id}>
                                                    {renderMessage(message)}
                                                </div>
                                            ))
                                    ) : (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-gray-400">No conversation selected</p>
                                        </div>
                                    )}
                                    
                                    {/* Typing indicator */}
                                    {isTyping && (
                                        <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/30 w-24">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={sendMessage} className="mt-4 border-t border-blue-700/50 pt-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={handleMessageInput}
                                            placeholder="Type your message..."
                                            className="flex-grow p-3 rounded-lg bg-slate-800/70 text-white border border-blue-700/50 focus:border-cyan-500 focus:ring-cyan-500"
                                            disabled={sendingMessage}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:hover:from-cyan-600 disabled:hover:to-blue-600 flex items-center"
                                        >
                                            {sendingMessage ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                'Send'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                <svg className="w-16 h-16 mb-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-lg">Select a conversation to start chatting</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Or search for a user to start a new conversation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Connection status indicator */}
            {renderConnectionStatus()}

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Conversation</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this entire conversation? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteConversation}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for message highlighting */}
            <style jsx>{`
                .highlight-message {
                    animation: highlight 2s ease-in-out;
                }

                @keyframes highlight {
                    0%, 100% {
                        background-color: transparent;
                    }
                    50% {
                        background-color: rgba(14, 165, 233, 0.3);
                    }
                }
            `}</style>
        </div>
    );
};

export default Messages;