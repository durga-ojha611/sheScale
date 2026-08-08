import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Mentorship.css';

const AITwinChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderRole: 'ai',
      content: `Hello ${user?.profile?.businessName || 'founder'}! I'm your AI Twin Mentor. Whether you're struggling with go-to-market strategies or unit economics, I'm here to give you realistic, actionable advice. What's on your mind today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), senderRole: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use the actual backend API we created
      const response = await api.post('/mentor/ai-twin', {
        message: input,
        chatHistory: messages,
        businessIdea: user?.businessDetails?.businessIdea || ''
      });

      const aiResponse = {
        id: Date.now() + 1,
        senderRole: 'ai',
        content: response.data.data.reply
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: Date.now() + 1,
        senderRole: 'ai',
        content: 'Sorry, I am having trouble connecting right now. Let us try again in a bit.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.senderRole}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {msg.senderRole === 'ai' ? <Bot size={16} /> : <User size={16} />}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>
                {msg.senderRole === 'ai' ? 'AI Mentor' : 'You'}
              </span>
            </div>
            {/* Simple text render; in a real app use react-markdown */}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble ai">
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px' }}>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder="Ask me anything about scaling, fundraising, or operations..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
        />
        <button 
          className="chat-send-btn" 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AITwinChat;
