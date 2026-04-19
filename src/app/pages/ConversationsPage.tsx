import { useEffect, useRef, useState } from 'react';
import { Search, Send, Facebook, Instagram, Globe, MoreVertical, Tag, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getConversationMessageStableKey, useConversationStore } from '../store/conversationStore';

export function ConversationsPage() {
  const {
    conversations,
    selectedConversationId,
    messages,
    aiEnabled,
    isSending,
    isLoading,
    error,
    fetchConversations,
    selectConversation,
    sendMessage,
    retryMessage,
    toggleAI,
  } = useConversationStore();

  const [messageInput, setMessageInput] = useState('');
  const [retryingMessageId, setRetryingMessageId] = useState<number | null>(null);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const submitLockRef = useRef(false);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') {
      return true;
    }

    return navigator.onLine;
  });

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      void selectConversation(conversations[0].id);
    }
  }, [conversations, selectedConversationId, selectConversation]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const selectedConv = conversations.find(c => c.id === selectedConversationId);
  const isSendingMessage = isSending || isSubmittingMessage;

  const customerInfo = {
    name: selectedConv?.customerName || '',
    email: 'sarah.miller@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    source: selectedConv?.source || 'facebook',
    tags: ['Wholesale', 'New Lead', 'High Priority'],
    conversations: 3,
    joinDate: 'April 15, 2026'
  };

  const aiSuggestions = [
    'Send wholesale catalog',
    'Schedule a call with sales team',
    'Request company information'
  ];

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'facebook': return <Facebook className="w-3 h-3 text-blue-600" />;
      case 'instagram': return <Instagram className="w-3 h-3 text-pink-600" />;
      case 'web': return <Globe className="w-3 h-3 text-gray-600" />;
      default: return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleSendMessage = async () => {
    const trimmedInput = messageInput.trim();
    if (!trimmedInput || !selectedConversationId || isSending || submitLockRef.current) return;

    submitLockRef.current = true;
    setIsSubmittingMessage(true);

    try {
      const sent = await sendMessage(selectedConversationId, trimmedInput);
      if (sent) {
        setMessageInput('');
      }
    } finally {
      submitLockRef.current = false;
      setIsSubmittingMessage(false);
    }
  };

  const handleRetryMessage = async (messageId: number) => {
    if (!selectedConversationId || isSending) return;

    setRetryingMessageId(messageId);
    try {
      await retryMessage(selectedConversationId, messageId);
    } finally {
      setRetryingMessageId(null);
    }
  };

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">Loading conversations...</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => void selectConversation(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {conv.customerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={conv.unread ? 'font-medium' : ''}>{conv.customerName}</span>
                      <div className="flex items-center gap-1">
                        {getSourceIcon(conv.source)}
                        {conv.unread && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                      <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(conv.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                  {selectedConv.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div>{selectedConv.customerName}</div>
                  <div className="text-xs text-gray-500 capitalize">{selectedConv.source} Messenger</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">AI Reply</span>
                  <div
                    onClick={() => toggleAI(!aiEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      aiEnabled ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      aiEnabled ? 'translate-x-5' : ''
                    }`} />
                  </div>
                </label>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!isOnline && (
                <div className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                  You are offline. Messages cannot be delivered until your connection is restored.
                </div>
              )}
              {messages.map((msg) => (
                <div key={getConversationMessageStableKey(msg)} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-md ${msg.sender === 'customer' ? 'order-2' : 'order-1'}`}>
                    {msg.aiGenerated && (
                      <div className="text-xs text-purple-600 mb-1 flex items-center gap-1 justify-end">
                        <span>AI Generated</span>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.deliveryStatus === 'failed'
                        ? 'bg-red-50 border border-red-200 text-red-900'
                        : msg.sender === 'customer'
                        ? 'bg-white border border-gray-200'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 flex items-center gap-2 ${msg.sender !== 'customer' ? 'justify-end' : ''}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.deliveryStatus === 'pending' && (
                        <span>{retryingMessageId === msg.id ? 'Retrying...' : 'Sending...'}</span>
                      )}
                      {msg.deliveryStatus === 'failed' && selectedConversationId && (
                        <>
                          <span className="text-red-600">Failed to send</span>
                          <button
                            type="button"
                            onClick={() => void handleRetryMessage(msg.id)}
                            disabled={isSending}
                            className="text-red-600 hover:text-red-700 underline disabled:opacity-50"
                          >
                            Retry
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Suggestions (when enabled) */}
            {aiEnabled && (
              <div className="px-6 py-3 bg-purple-50 border-t border-purple-100">
                <div className="text-xs text-purple-700 mb-2">AI Suggested Responses:</div>
                <div className="flex gap-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessageInput(suggestion)}
                      className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm hover:bg-purple-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={isSendingMessage}
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={isSendingMessage || !messageInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start
          </div>
        )}
      </div>

      {/* Customer Info Panel */}
      {selectedConv && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3">
                {selectedConv.customerName.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-lg mb-1">{customerInfo.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{customerInfo.source}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{customerInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{customerInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{customerInfo.location}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                <Tag className="w-4 h-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {customerInfo.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total conversations:</span>
                <span>{customerInfo.conversations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">First contact:</span>
                <span>{customerInfo.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
