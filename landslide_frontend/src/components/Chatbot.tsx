import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatResponse {
  reply: string;  // Changed from 'response' to 'reply' to match backend
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your landslide risk assessment assistant. How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChatbot = (): void => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
  };

  const sendMessage = async (): Promise<void> => {
    if (inputMessage.trim() === '') return;
    
    // Add user message to chat
    const userMessage: Message = { text: inputMessage, isBot: false };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Fixed: Match payload format with backend expectations
      const response = await fetch('http://localhost:8000/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: inputMessage  // Changed from 'query' to 'prompt' to match backend
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server error:', response.status, errorData);
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data: ChatResponse = await response.json();
      
      // Add bot response to chat - using 'reply' field instead of 'response'
      setMessages(prev => [...prev, { 
        text: data.reply || "Sorry, I couldn't process that request.", 
        isBot: true 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat button (always visible) */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 flex items-center justify-center transition-all duration-300"
        aria-label="Open chat assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat window */}
      {/* Chat window */}
{/* Chat window */}
{/* Chat window */}
{isOpen && (
  <div className="fixed bottom-24 right-6 w-64 md:w-80 bg-white rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden border border-gray-200 min-h-[500px]">
    
    {/* Chat header */}
    <div className="bg-blue-600 text-white px-4 py-3 flex items-center">
      <MessageSquare className="mr-2 h-5 w-5" />
      <h3 className="font-medium">Landslide Risk Assistant</h3>
    </div>

    {/* Messages container */}
    <div className="flex-1 p-4 overflow-y-auto max-h-[500px] bg-gray-50">
      {messages.map((message, index) => (
        <div key={index} className={`mb-3 ${message.isBot ? 'flex' : 'flex justify-end'}`}>
          <div className={`px-4 py-2 rounded-lg max-w-[85%] ${message.isBot ? 'bg-gray-200 text-gray-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
            {/* ✅ Remove asterisks (*) from the message */}
            {message.text.replace(/\*/g, '')}
          </div>
        </div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex mb-3">
          <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-tl-none">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* Input area */}
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-center">
        <textarea
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your question here..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-10 max-h-32"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={inputMessage.trim() === '' || isLoading}
          className={`ml-2 p-2 rounded-full ${inputMessage.trim() === '' || isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
};

export default Chatbot;