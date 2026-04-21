import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import './ChatBot.css';

const ChatBot = () => {
  const { isChatOpen, closeChat } = useChat();
  const [messages, setMessages] = useState([
    { role: 'model', text: "Aura Assistant online. How can I help you?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Ref for auto-focus

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when chat opens or after loading
  useEffect(() => {
    if (isChatOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isChatOpen, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const chatApiUrl = import.meta.env.VITE_CHAT_API_URL;
      
      if (!chatApiUrl) {
        throw new Error("API configuration missing: VITE_CHAT_API_URL");
      }

      const history = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          history: history 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        const errorMessage = data.detail || data.message || "Error: Connection failed. Contact support@aurastore.com.";
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: errorMessage
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "Error: Server unreachable. Check connection." 
      }]);
    } finally {
      setIsLoading(false);
      // Auto-focus after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="chat-header">
              <div className="flex items-center gap-3">
                <Bot size={14} strokeWidth={2} />
                <h3>Aura Assistant</h3>
              </div>
              <button onClick={closeChat} className="close-btn">
                <X size={16} strokeWidth={1} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`message-wrapper ${msg.role === 'model' ? 'bot' : 'user'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  {msg.role === 'model' && (
                    <div className="message-icon bot">
                      <Bot size={12} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className={`message ${msg.role === 'model' ? 'bot' : 'user'}`}>
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="message-icon user">
                      <User size={12} strokeWidth={1.5} />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                ref={inputRef}
                type="text"
                placeholder="Message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className="send-btn" 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={14} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;
