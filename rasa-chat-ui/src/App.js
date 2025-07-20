import React, { useState, useEffect, useRef } from 'react';
import './App.css';

//npm start : Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

// Simple avatar SVGs
const BotAvatar = () => (
  <div className="avatar bot-avatar">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="16" fill="#A259E6"/>
      <rect x="8" y="14" width="16" height="8" rx="4" fill="#fff"/>
      <circle cx="12" cy="18" r="1.5" fill="#A259E6"/>
      <circle cx="20" cy="18" r="1.5" fill="#A259E6"/>
      <rect x="14" y="8" width="4" height="4" rx="2" fill="#fff"/>
    </svg>
  </div>
);
const UserAvatar = () => (
  <div className="avatar user-avatar">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="16" fill="#fff"/>
      <circle cx="16" cy="14" r="6" fill="#A259E6"/>
      <rect x="8" y="22" width="16" height="4" rx="2" fill="#A259E6"/>
    </svg>
  </div>
);

const WELCOME_MESSAGE = {
  text: "Hello! I'm Paramedic, your First Aid assistant. How can I help you with your medical concern today?",
  sender: 'bot',
};

function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [quickReplies, setQuickReplies] = useState([]);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, quickReplies]);

  // Send user message to Rasa and handle bot response
  const sendMessage = async (msgText) => {
    const userMessage = { text: msgText, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setQuickReplies([]); // Clear quick replies on user send
    setInput('');

    try {
      const res = await fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', message: msgText }),
      });
      const data = await res.json();
      let botMsgs = [];
      let newQuickReplies = [];
      data.forEach((msg) => {
        if (msg.text) {
          botMsgs.push({ text: msg.text, sender: 'bot' });
        }
        if (msg.buttons) {
          newQuickReplies = msg.buttons.map((btn) => ({ title: btn.title, payload: btn.payload }));
        }
      });
      if (botMsgs.length) setMessages((prev) => [...prev, ...botMsgs]);
      setQuickReplies(newQuickReplies);
    } catch (err) {
      setMessages((prev) => [...prev, { text: 'Sorry, something went wrong.', sender: 'bot' }]);
    }
  };

  // Handle input box send
  const handleSend = () => {
    if (input.trim()) sendMessage(input.trim());
  };

  // Handle quick reply button click
  const handleQuickReply = (payload) => {
    sendMessage(payload);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <BotAvatar />
        <div>
          <div className="chatbot-title">Paramedic <span style={{fontSize: '1rem', color: '#e5d8fa', marginLeft: 6}}>(المُسعف)</span></div>
          <div className="chatbot-status">● Online Now</div>
        </div>
        <div className="chatbot-close">⋯</div>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
          >
            {msg.sender === 'bot' && <BotAvatar />}
            <div className={`chat-bubble ${msg.sender}`}>
              <div className="sender-name">{msg.sender === 'bot' ? 'Paramedic (المُسعف)' : 'You'}</div>
              {msg.text}
            </div>
            {msg.sender === 'user' && <UserAvatar />}
          </div>
        ))}
        {/* Quick replies */}
        {quickReplies.length > 0 && (
          <div className="quick-replies">
            {quickReplies.map((btn, i) => (
              <button
                key={i}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(btn.payload)}
              >
                {btn.title}
              </button>
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chatbot-input-row">
        <input
          className="chatbot-input"
          type="text"
          value={input}
          placeholder="Reply to LeadBot..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chatbot-send-btn" onClick={handleSend}>
          Send
        </button>
      </div>
      <div className="chatbot-footer">
        Powered <span className="footer-bolt">⚡</span> by <a href="https://www.linkedin.com/in/zeyadmohamed2004" target="_blank" rel="noopener noreferrer" className="footer-link">Zeyad</a>
      </div>
    </div>
  );
}

export default App;
