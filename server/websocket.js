// Update websocket.js with improved reliability

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ 
        server,
        path: '/ws',
        clientTracking: true
    });

    // Store active connections with timestamps
    const connections = new Map();
    
    // Store message delivery status
    const messageDeliveryStatus = new Map();
    
    // Keep track of connection status by user
    const connectionStatus = new Map();

    // Set up ping interval to detect disconnected clients
    const PING_INTERVAL = 30000; // 30 seconds
    
    // Function to send a ping to all clients
    const pingClients = () => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    // Reset the alive flag before pinging
                    client.isAlive = false;
                    client.ping();
                    
                    // Check how long since last received message
                    const userId = client.userId;
                    if (userId && connectionStatus.has(userId)) {
                        const status = connectionStatus.get(userId);
                        const now = Date.now();
                        
                        // If no response for 2 minutes, mark as potentially disconnected
                        if (now - status.lastActivity > 120000) {
                            connectionStatus.set(userId, {
                                ...status,
                                status: 'inactive'
                            });
                            console.log(`User ${userId} marked as inactive due to inactivity`);
                        }
                    }
                } catch (error) {
                    console.error('Error pinging client:', error);
                }
            }
        });
    };

    // Start the ping interval
    const pingInterval = setInterval(pingClients, PING_INTERVAL);

    // Handle new connections
    wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection attempt from:', req.socket.remoteAddress);
        
        // Set initial alive state
        ws.isAlive = true;
        
        // Handle pong responses
        ws.on('pong', () => {
            ws.isAlive = true;
            
            // Update last activity if we know the user ID
            if (ws.userId) {
                const status = connectionStatus.get(ws.userId) || { lastActivity: 0, status: 'unknown' };
                connectionStatus.set(ws.userId, {
                    ...status,
                    lastActivity: Date.now(),
                    status: 'active'
                });
            }
        });

        // Handle authentication
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log('Received WebSocket message:', data);
                
                if (data.type === 'auth') {
                    const userId = data.userId;
                    
                    // Store the user's connection with timestamp
                    connections.set(userId, ws);
                    ws.userId = userId; // Store userId on the socket
                    
                    // Update connection status
                    connectionStatus.set(userId, {
                        status: 'active',
                        lastActivity: Date.now(),
                        connected: true,
                        ip: req.socket.remoteAddress
                    });
                    
                    console.log(`User ${userId} authenticated and connected`);
                    
                    // Send confirmation message
                    ws.send(JSON.stringify({
                        type: 'auth_success',
                        message: 'Authentication successful',
                        timestamp: Date.now()
                    }));
                    
                    // Broadcast user online status
                    broadcastUserStatus(userId, 'online');
                } 
                else if (data.type === 'message_received') {
                    // Handle message receipt confirmation
                    const { messageId, userId } = data;
                    if (messageId) {
                        messageDeliveryStatus.set(messageId, {
                            status: 'delivered',
                            timestamp: Date.now()
                        });
                        
                        // Notify the sender that the message was delivered
                        if (userId) {
                            const senderConnection = connections.get(userId);
                            if (senderConnection && senderConnection.readyState === WebSocket.OPEN) {
                                senderConnection.send(JSON.stringify({
                                    type: 'message_delivered',
                                    messageId,
                                    timestamp: Date.now()
                                }));
                            }
                        }
                    }
                }
                else if (data.type === 'sync_request') {
                    // Client is requesting to sync messages
                    // This is handled via API, but we mark the user as actively syncing
                    if (ws.userId) {
                        const status = connectionStatus.get(ws.userId) || {};
                        connectionStatus.set(ws.userId, {
                            ...status,
                            lastActivity: Date.now(),
                            status: 'syncing'
                        });
                    }
                }
                
                // Keep track of last activity
                if (ws.userId) {
                    const status = connectionStatus.get(ws.userId) || {};
                    connectionStatus.set(ws.userId, {
                        ...status,
                        lastActivity: Date.now()
                    });
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
                try {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format',
                        timestamp: Date.now()
                    }));
                } catch (sendError) {
                    console.error('Error sending error response:', sendError);
                }
            }
        });

        // Handle client disconnection
        ws.on('close', (code, reason) => {
            console.log(`WebSocket connection closed: ${code} ${reason}`);
            
            // Find the user ID for this connection and remove it
            if (ws.userId) {
                const userId = ws.userId;
                
                // Only remove if this is the current connection for this user
                if (connections.get(userId) === ws) {
                    connections.delete(userId);
                    
                    // Update status to disconnected
                    const status = connectionStatus.get(userId) || {};
                    connectionStatus.set(userId, {
                        ...status,
                        connected: false,
                        status: 'offline',
                        lastDisconnect: Date.now() 
                    });
                    
                    console.log(`User ${userId} disconnected`);
                    
                    // Broadcast user offline status after a delay
                    // (to handle reconnections)
                    setTimeout(() => {
                        // Check if user is still disconnected
                        const currentStatus = connectionStatus.get(userId);
                        if (currentStatus && !currentStatus.connected) {
                            broadcastUserStatus(userId, 'offline');
                        }
                    }, 5000);
                }
            }
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            if (ws.userId) {
                const userId = ws.userId;
                const status = connectionStatus.get(userId) || {};
                connectionStatus.set(userId, {
                    ...status,
                    lastError: Date.now(),
                    errorMessage: error.message
                });
            }
        });
    });

    // Function to broadcast user status changes
    const broadcastUserStatus = (userId, status) => {
        const message = {
            type: 'user_status',
            userId,
            status,
            timestamp: Date.now()
        };
        
        // Find all users who have conversations with this user
        // This would ideally be fetched from a database
        // For now, broadcast to all connected users
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.userId !== userId) {
                try {
                    client.send(JSON.stringify(message));
                } catch (error) {
                    console.error(`Error broadcasting status to client:`, error);
                }
            }
        });
    };

    // Function to send message to a specific user with delivery tracking
    const sendToUser = (userId, message) => {
        const connection = connections.get(userId);
        let delivered = false;
        
        if (connection && connection.readyState === WebSocket.OPEN) {
            try {
                // Add timestamp to message
                message.timestamp = Date.now();
                
                // Add message ID for tracking if not present
                if (message.type === 'new_message' && message.message && !message.messageId) {
                    message.messageId = message.message._id.toString();
                }
                
                // Track delivery attempt
                if (message.messageId) {
                    messageDeliveryStatus.set(message.messageId, {
                        status: 'sent',
                        timestamp: Date.now(),
                        recipient: userId,
                        attempts: (messageDeliveryStatus.get(message.messageId)?.attempts || 0) + 1
                    });
                }
                
                connection.send(JSON.stringify(message));
                delivered = true;
                
                console.log(`Message sent to user ${userId} successfully`);
                
                // Return true to indicate successful delivery attempt
                return true;
            } catch (error) {
                console.error(`Error sending message to user ${userId}:`, error);
                
                // Track delivery failure
                if (message.messageId) {
                    messageDeliveryStatus.set(message.messageId, {
                        status: 'failed',
                        timestamp: Date.now(),
                        recipient: userId,
                        error: error.message,
                        attempts: (messageDeliveryStatus.get(message.messageId)?.attempts || 0) + 1
                    });
                }
                
                return false;
            }
        } else {
            console.log(`User ${userId} is not connected or connection is not open`);
            
            // Track delivery failure
            if (message.messageId) {
                messageDeliveryStatus.set(message.messageId, {
                    status: 'pending',
                    timestamp: Date.now(),
                    recipient: userId,
                    reason: 'user_not_connected',
                    attempts: (messageDeliveryStatus.get(message.messageId)?.attempts || 0) + 1
                });
            }
            
            return false;
        }
    };

    // Function to broadcast message to all connected users
    const broadcast = (message, excludeUserId = null) => {
        let deliveredCount = 0;
        const failedRecipients = [];
        
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                // Skip excluded user
                if (excludeUserId && client.userId === excludeUserId) {
                    return;
                }
                
                try {
                    // Add timestamp to message
                    message.timestamp = Date.now();
                    client.send(JSON.stringify(message));
                    deliveredCount++;
                } catch (error) {
                    console.error('Error broadcasting message:', error);
                    if (client.userId) {
                        failedRecipients.push(client.userId);
                    }
                }
            }
        });
        
        return {
            success: deliveredCount > 0,
            deliveredCount,
            totalClients: wss.clients.size,
            failedRecipients
        };
    };

    // Clean up interval on server close
    server.on('close', () => {
        clearInterval(pingInterval);
        console.log('WebSocket server closed, cleared ping interval');
    });

    // Clean up terminated connections
    const terminationInterval = setInterval(() => {
        wss.clients.forEach(client => {
            if (client.isAlive === false) {
                console.log('Terminating inactive WebSocket connection');
                return client.terminate();
            }
        });
    }, PING_INTERVAL);

    return {
        sendToUser,
        broadcast,
        getConnectionStatus: (userId) => connectionStatus.get(userId) || { status: 'unknown' },
        getMessageStatus: (messageId) => messageDeliveryStatus.get(messageId),
        getActiveConnections: () => connections.size
    };
}

module.exports = setupWebSocket;