import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { api } from './api';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversation details when selected
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const convs = await api.listConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const conv = await api.getConversation(id);
      setCurrentConversation(conv);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation();
      setConversations([
        { 
          id: newConv.id, 
          created_at: newConv.created_at, 
          title: newConv.title || "New Conversation",
          message_count: 0 
        },
        ...conversations,
      ]);
      setCurrentConversationId(newConv.id);
      setCurrentConversation(newConv); // Charger directement la nouvelle conversation
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
  };

  const handleSendMessage = async (content) => {
    if (!currentConversationId) return;
    if (!content.trim()) return; // Empêcher l'envoi de messages vides

    setIsLoading(true);
    
    // Sauvegarder l'ID de la conversation avant l'envoi
    const conversationIdBeforeSend = currentConversationId;
    
    try {
      // Optimistically add user message to UI
      const userMessage = { 
        role: 'user', 
        content,
        timestamp: new Date().toISOString() 
      };
      
      setCurrentConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, userMessage],
        };
      });

      // Create a partial assistant message that will be updated progressively
      const assistantMessage = {
        role: 'assistant',
        stage1: null,
        stage2: null,
        stage3: null,
        metadata: null,
        loading: {
          stage1: false,
          stage2: false,
          stage3: false,
        },
        timestamp: new Date().toISOString()
      };

      // Add the partial assistant message
      setCurrentConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
        };
      });

      // Send message with streaming
      await api.sendMessageStream(currentConversationId, content, (eventType, event) => {
        // Vérifier qu'on est toujours dans la même conversation
        if (currentConversationId !== conversationIdBeforeSend) {
          console.warn('Conversation changed during streaming, ignoring events');
          return;
        }

        switch (eventType) {
          case 'stage1_start':
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.loading.stage1 = true;
              }
              return { ...prev, messages };
            });
            break;

          case 'stage1_complete':
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.stage1 = event.data;
                lastMsg.loading.stage1 = false;
              }
              return { ...prev, messages };
            });
            break;

          case 'stage2_start':
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.loading.stage2 = true;
              }
              return { ...prev, messages };
            });
            break;

          case 'stage2_complete':
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.stage2 = event.data;
                lastMsg.metadata = event.metadata;
                lastMsg.loading.stage2 = false;
              }
              return { ...prev, messages };
            });
            break;

          case 'stage3_start':
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.loading.stage3 = true;
              }
              return { ...prev, messages };
            });
            break;

          case 'stage3_complete':
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.stage3 = event.data;
                lastMsg.loading.stage3 = false;
              }
              return { ...prev, messages };
            });
            break;

          case 'title_complete':
            // Reload conversations to get updated title
            loadConversations();
            break;

          case 'complete':
            // RÉPARATION CRITIQUE : Recharger la conversation complète depuis le serveur
            loadConversation(currentConversationId);
            
            // Reload conversations list
            loadConversations();
            setIsLoading(false);
            break;

          case 'error':
            console.error('Stream error:', event.message);
            // En cas d'erreur, supprimer le message assistant partiel
            setCurrentConversation((prev) => {
              if (!prev || !prev.messages) return prev;
              return {
                ...prev,
                messages: prev.messages.filter((msg, index) => 
                  index !== prev.messages.length - 1 || msg.role !== 'assistant'
                ),
              };
            });
            setIsLoading(false);
            break;

          default:
            console.log('Unknown event type:', eventType);
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic messages on error
      setCurrentConversation((prev) => {
        if (!prev || !prev.messages) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((msg, index) => 
            index < prev.messages.length - 2 || msg.role === 'user'
          ),
        };
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <ChatInterface
        conversation={currentConversation}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
