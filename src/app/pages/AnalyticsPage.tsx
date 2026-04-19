import { useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MessageSquare, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalyticsStore } from '../store/analyticsStore';

const cardColorClasses = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
} as const;

export function AnalyticsPage() {
  const { stats, chartData, isLoading, error, fetchAll } = useAnalyticsStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const statsCards = [
    {
      label: 'Messages This Month',
      value: stats.totalConversations.toLocaleString(),
      change: '+18.2%',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      label: 'Avg Response Time',
      value: '1.2s',
      change: '-68.5%',
      icon: Clock,
      color: 'green'
    },
    {
      label: 'AI Success Rate',
      value: '95.8%',
      change: '+12.3%',
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: '+8.3%',
      icon: TrendingUp,
      color: 'orange'
    },
  ];

  if (isLoading || !chartData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Analytics</h1>
        <p className="text-gray-600">Track your AI assistant's performance and impact on your business</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const colorClass = cardColorClasses[stat.color as keyof typeof cardColorClasses];

          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${colorClass.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colorClass.text}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
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

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Messages Handled */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg mb-6">Messages Handled Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.messagesHandled}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} name="Total Messages" />
              <Line type="monotone" dataKey="aiHandled" stroke="#8b5cf6" strokeWidth={2} name="AI Handled" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-gray-600">Total Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full" />
              <span className="text-gray-600">AI Handled</span>
            </div>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg mb-6">Messages by Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.channelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.channelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            {chartData.channelDistribution.map((channel) => (
              <div key={channel.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                <span className="text-gray-600">{channel.name} ({channel.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg mb-6">Conversion Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.conversionRate}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="rate" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center mt-4 text-sm text-gray-600">Monthly conversion rate (%)</div>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg mb-6">Response Time Improvement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.responseTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={3} name="Avg Time (seconds)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center mt-4 text-sm text-gray-600">Average response time in seconds</div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl mb-4">Key Insights</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">96%</div>
            <div className="text-sm opacity-90">of customers prefer instant AI responses over waiting for human support</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">3.5x</div>
            <div className="text-sm opacity-90">increase in lead capture since enabling AI auto-reply</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">$12,500</div>
            <div className="text-sm opacity-90">estimated revenue generated from AI-handled conversations this month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
