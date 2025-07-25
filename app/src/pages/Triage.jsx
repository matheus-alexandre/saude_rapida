import React, { useState, useEffect, useRef } from 'react';
import '../styles/globals.css';

const Message = ({ text, sender }) => (
  <div className={`message ${sender}`}>{text}</div>
);

const ChatWindow = ({ messages }) => {
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <Message key={index} text={msg.text} sender={msg.sender} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

const InputBar = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form className="input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={isLoading ? "Aguarde a resposta..." : "Digite sua mensagem..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>Enviar</button>
    </form>
  );
};

export const TriagePage = () => {
  const BACKEND_URL = "http://localhost:11435/chat";

  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNameForm, setShowNameForm] = useState(true);

  const [messages, setMessages] = useState([
    { text: `Olá ${userName}! Sou o assistente de triagem da UPA. Como posso ajudar você hoje?`, sender: 'bot' }
  ]);
  
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setMessages([
        { text: `Olá ${userName}! Sou o assistente de triagem da UPA. Como posso ajudar você hoje?`, sender: 'bot' }
      ]);
      setShowNameForm(false);
    }
  };

  const handleSendMessage = async (userText) => {
    setIsLoading(true);
    const newMessages = [...messages, { text: userText, sender: 'user' }];
    setMessages(newMessages);
    setMessages(prev => [...prev, { text: '', sender: 'bot' }]);
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: userText,
                stream: true,
                history: messages,
                name: userName
            }),
        });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        
        setMessages(currentMessages => {
            const latestMessages = [...currentMessages];
            const lastMessageIndex = latestMessages.length - 1;
            latestMessages[lastMessageIndex].text += chunk;
            return latestMessages;
        });
      }

    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
      setMessages(prev => [...prev.slice(0, -1), { text: "Desculpe, não consegui me conectar ao servidor. Tente novamente mais tarde.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showNameForm) {
    return (
      <div className="chat-container">
        <div className="chat-header">Saúde Rápida - Triagem UPA</div>
        <form style={{ padding: 32 }} onSubmit={handleNameSubmit}>
          <label htmlFor="name">Digite seu nome:</label>
          <input
            id="name"
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            style={{ marginLeft: 12, padding: 8, borderRadius: 8 }}
            required
          />
          <button type="submit" style={{ marginLeft: 12, padding: 8, borderRadius: 8 }}>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="chat-container">
        <div className="chat-header">Saúde Rápida - Triagem UPA</div>
        <ChatWindow messages={messages} />
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </>
  );
};