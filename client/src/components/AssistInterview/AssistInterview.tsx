import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2 } from 'lucide-react';
import { questionsApi } from '../../api/services/QuestionsApi';
import './AssistInterview.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isQuestion?: boolean;
}

export default function AssistInterview() {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const technology = searchParams.get('tech') || '';
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [actualQuestions, setActualQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    let ignore = false;
    const fetchQuestions = async () => {
      try {
        const q = await questionsApi.getQuestions(projectId!, technology);
        if (ignore) return;
        setActualQuestions(q);
        
        if (q.length === 0) {
          setMessages([
            { id: '1', sender: 'bot', text: `No practice questions found for ${technology}. Please ask a manager to sync them from the project dashboard.` }
          ]);
          setInterviewComplete(true);
          setIsLoading(false);
          return;
        }

        setMessages([
          { id: '1', sender: 'bot', text: `Welcome to the Assist Interview flow for ${technology}! I will ask you some practice questions based on past interviews.` }
        ]);
        
        setIsTyping(true);
        setTimeout(() => {
          if (ignore) return;
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: `Question 1: ${q[0]}`,
            isQuestion: true 
          }]);
          setIsTyping(false);
        }, 1500);

      } catch (e) {
        if (ignore) return;
        setMessages([
          { id: '1', sender: 'bot', text: 'Error loading questions. Please try again later.' }
        ]);
        setInterviewComplete(true);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    
    if (projectId && technology) {
      fetchQuestions();
    }

    return () => {
      ignore = true;
    };
  }, [projectId, technology]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping || interviewComplete || actualQuestions.length === 0) return;

    const userMsg = inputValue.trim();
    const currentQ = actualQuestions[questionIndex];
    setInputValue('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Evaluate Answer via Backend
      const result = await questionsApi.evaluateAnswer(projectId!, technology, currentQ, userMsg);
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: `Feedback: ${result.feedback}` 
      }]);

      if (questionIndex + 1 < actualQuestions.length) {
        setTimeout(() => {
          setQuestionIndex(prev => prev + 1);
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: `Question ${questionIndex + 2}: ${actualQuestions[questionIndex + 1]}`,
            isQuestion: true 
          }]);
          setIsTyping(false);
        }, 1500);
      } else {
        setTimeout(() => {
          setInterviewComplete(true);
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: "Great job! You've completed all the practice questions for this technology." 
          }]);
          setIsTyping(false);
        }, 1500);
      }
    } catch (e) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: 'Sorry, I encountered an error evaluating your answer. Let\'s continue.' 
      }]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn outline" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Assist Interview</h2>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{technology} Practice</span>
          </div>
        </div>
        {interviewComplete && (
          <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
            Completed
          </span>
        )}
      </div>

      <div className="chat-messages">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader2 className="spinner text-primary" size={32} />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-bubble" style={{ border: msg.isQuestion ? '1px solid rgba(59, 130, 246, 0.4)' : 'none' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-bubble typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form className="chat-form" onSubmit={handleSend}>
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={interviewComplete ? "Interview complete" : "Type your answer... (Press Enter to send)"}
            disabled={isTyping || interviewComplete}
          />
          <button type="submit" className="send-btn" disabled={!inputValue.trim() || isTyping || interviewComplete}>
            {isTyping ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
