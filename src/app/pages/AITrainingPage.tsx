import { useEffect, useState } from 'react';
import { Upload, Plus, Trash2, Edit, Send, Bot } from 'lucide-react';
import { useAITrainingStore } from '../store/aiTrainingStore';

export function AITrainingPage() {
  const {
    knowledgeBase,
    isLoading,
    isTraining,
    isTesting,
    testResult,
    fetchKnowledgeBase,
    addKnowledgeItem,
    deleteKnowledgeItem,
    trainModel,
    testAI,
    clearTestResult,
  } = useAITrainingStore();

  const [activeTab, setActiveTab] = useState<'knowledge' | 'test'>('knowledge');
  const [testMessage, setTestMessage] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  const handleTestSubmit = async () => {
    if (!testMessage.trim()) return;
    await testAI(testMessage);
    setTestMessage('');
  };

  const handleAddKnowledge = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    await addKnowledgeItem({
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
    });

    setNewQuestion('');
    setNewAnswer('');
    setNewCategory('General');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">AI Training</h1>
        <p className="text-gray-600">Train your AI assistant with your business knowledge and FAQs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">{knowledgeBase.length}</div>
          <div className="text-sm text-gray-600">Knowledge Base Items</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">94%</div>
          <div className="text-sm text-gray-600">AI Accuracy Score</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">1,248</div>
          <div className="text-sm text-gray-600">Questions Answered</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'knowledge'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'test'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Test AI Response
            </button>
          </div>
        </div>

        {activeTab === 'knowledge' && (
          <div className="p-6">
            {/* Upload Section */}
            <div className="mb-8">
              <h3 className="text-lg mb-4">Quick Upload</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <div className="mb-2">Upload CSV File</div>
                  <p className="text-sm text-gray-600">Bulk import Q&A pairs from spreadsheet</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <div className="mb-2">Upload Text File</div>
                  <p className="text-sm text-gray-600">Import FAQs from text document</p>
                </div>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Manual Q&A Entry</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm mb-2">Question</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What do customers ask?"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Answer</label>
                  <textarea
                    rows={4}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="How should the AI respond?"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>General</option>
                    <option>Pricing</option>
                    <option>Shipping</option>
                    <option>Returns</option>
                    <option>Payment</option>
                  </select>
                </div>
                <button
                  onClick={handleAddKnowledge}
                  disabled={isLoading || !newQuestion.trim() || !newAnswer.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Q&A'}
                </button>
              </div>
            </div>

            {/* Knowledge Base List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Your Knowledge Base</h3>
                <button
                  onClick={trainModel}
                  disabled={isTraining}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? 'Training...' : 'Train AI Model'}
                </button>
              </div>
              {isLoading && knowledgeBase.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Loading knowledge base...</div>
              ) : (
                <div className="space-y-3">
                  {knowledgeBase.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {item.category}
                            </span>
                          </div>
                          <div className="mb-2">Q: {item.question}</div>
                          <div className="text-sm text-gray-600">A: {item.answer}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-white rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteKnowledgeItem(item.id)}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg mb-2">Test Your AI Assistant</h3>
              <p className="text-sm text-gray-600">Ask questions to see how your AI would respond based on current training</p>
            </div>

            {/* Test Results */}
            <div className="bg-white border border-gray-200 rounded-lg mb-4 min-h-[400px] p-4 space-y-4">
              {!testResult && !isTesting ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation to test your AI</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResult && (
                    <>
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2 max-w-md">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                            <p className="text-sm mb-2">{testResult.answer}</p>
                            <div className="text-xs text-gray-600">
                              Confidence: {(testResult.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={clearTestResult}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Clear conversation
                      </button>
                    </>
                  )}
                  {isTesting && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                          <p className="text-sm text-gray-600">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Test Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTestSubmit()}
                placeholder="Ask a test question..."
                disabled={isTesting}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleTestSubmit}
                disabled={isTesting || !testMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isTesting ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
