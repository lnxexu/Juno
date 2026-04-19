import { Bell, User, CreditCard, Shield, Link as LinkIcon, Save } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and AI assistant preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl">Profile Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="john@business.com"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="My Business LLC"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl">Connected Channels</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">f</span>
                </div>
                <div>
                  <div>Facebook Messenger</div>
                  <div className="text-sm text-gray-600">Connected to @mybusiness</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-pink-600">ig</span>
                </div>
                <div>
                  <div>Instagram Direct</div>
                  <div className="text-sm text-gray-600">Connected to @mybusiness</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600">W</span>
                </div>
                <div>
                  <div>Website Chat Widget</div>
                  <div className="text-sm text-gray-600">Installed on mybusiness.com</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <button className="w-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors text-gray-600 hover:text-blue-600">
              + Add New Channel
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl">Notifications</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div>New Lead Notifications</div>
                <div className="text-sm text-gray-600">Get notified when AI captures a new lead</div>
              </div>
              <div className="relative w-11 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full cursor-pointer">
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div>AI Failure Alerts</div>
                <div className="text-sm text-gray-600">Alert me when AI cannot handle a conversation</div>
              </div>
              <div className="relative w-11 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full cursor-pointer">
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div>Weekly Performance Reports</div>
                <div className="text-sm text-gray-600">Receive weekly summary of AI performance</div>
              </div>
              <div className="relative w-11 h-6 bg-gray-300 rounded-full cursor-pointer">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl">Billing & Plan</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-4">
              <div className="text-sm opacity-90 mb-2">Current Plan</div>
              <div className="text-3xl mb-4">Professional</div>
              <div className="text-sm opacity-90">$99/month • Renews on May 18, 2026</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversations used this month:</span>
                <span>1,248 / 2,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Change Plan
              </button>
              <button className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Update Payment Method
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl">Security</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm mb-2">Change Password</label>
              <input
                type="password"
                placeholder="Current password"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
