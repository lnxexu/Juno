import { useEffect } from 'react';
import { MessageSquare, Users, TrendingUp, Zap, Clock, Facebook, Instagram, Globe, BarChart3 } from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { Link } from 'react-router';

export function DashboardOverview() {
  const { conversations, fetchConversations } = useConversationStore();
  const { stats, fetchStats } = useAnalyticsStore();

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  const statsCards = [
    {
      label: 'Total Conversations',
      value: stats.totalConversations.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      label: 'Leads Captured',
      value: stats.leadsCaptured.toLocaleString(),
      change: '+23.1%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Response Rate',
      value: `${stats.responseRate.toFixed(1)}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Zap,
      color: 'green'
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: '+8.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    },
  ];

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'web': return <Globe className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your AI assistant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Recent Conversations</h2>
              <Link to="/dashboard/conversations" className="text-blue-600 hover:text-blue-700 text-sm">View all</Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                to="/dashboard/conversations"
                className="block p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {conv.customerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={conv.unread ? 'font-medium' : ''}>{conv.customerName}</span>
                        {getSourceIcon(conv.source)}
                      </div>
                      <div className="flex items-center gap-2">
                        {conv.aiHandled && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">AI</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(conv.timestamp)}
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm truncate ${conv.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Status Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm opacity-90">AI Status: Active</span>
            </div>
            <h3 className="text-2xl mb-2">AI Assistant</h3>
            <p className="text-sm opacity-90 mb-4">Your AI is online and learning from every conversation</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-90">Messages handled today:</span>
                <span>156</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Avg response time:</span>
                <span>1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Accuracy score:</span>
                <span>94%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/dashboard/ai-training" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-sm">Train AI Model</div>
                </div>
              </Link>
              <Link to="/dashboard/leads" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm">View New Leads</div>
                </div>
              </Link>
              <Link to="/dashboard/analytics" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm">View Analytics</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
