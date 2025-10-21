import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import './ChatModal.css';

const ChatModal = ({ socket, user, chatRoomId, transactionId, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (transactionId) {
        setLoading(true);
        try {
          const { data } = await api.get(`/chat/${transactionId}`);
          setMessageList(data);
        } catch (error) {
          console.error("Failed to load chat history", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [transactionId]);

  useEffect(() => {
    if (!socket) return; // Don't set up listeners if socket isn't connected yet

    const messageHandler = (newMessage) => {
      // This handler is now ONLY for messages from OTHER users
      setMessageList((prev) => [...prev, newMessage]);
    };
    
    socket.on('receive_message', messageHandler);

    return () => {
      socket.off('receive_message', messageHandler);
    };
  }, [socket]); // Only re-run when the socket object itself changes

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' && chatRoomId && socket) {
      const messageData = {
        room: chatRoomId,
        transactionId: transactionId,
        authorId: user._id,
        message: currentMessage,
      };

      // --- THIS IS THE NEW LOGIC ---
      // We emit the message and provide a callback function
      socket.emit('send_message', messageData, (savedMessage) => {
        // This callback is executed by the server immediately after the message is saved.
        // This provides an instant update for the sender's UI.
        setMessageList((prev) => [...prev, savedMessage]);
      });
      
      setCurrentMessage('');
    }
  };

  // ... (The JSX part of the component is the same as the last version)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
           {/* ... header ... */}
        </div>
        <div className="chat-body">
          {loading && <p>Loading history...</p>}
          {messageList.map((msg) => (
            <div key={msg._id} className={`message-container ${user.username === msg.author.username ? 'sent' : 'received'}`}>
              <div className="message-content"><p>{msg.message}</p></div>
              <div className="message-meta">
                <span>{msg.author.username}</span>
                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        <div className="chat-footer">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type a message..."
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;