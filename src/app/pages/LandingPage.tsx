import { Link } from 'react-router';
import { MessageSquare, Zap, BarChart3, Users, CheckCircle2, ArrowRight, Star } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">ReplyAI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">Sign In</Link>
            <Link to="/dashboard" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:shadow-lg transition-shadow">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm mb-6">
          🎉 AI-Powered Customer Support for SMEs
        </div>
        <h1 className="text-5xl max-w-4xl mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Automate Customer Replies and Turn Messages into Sales with AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Save time, increase sales, and never miss a customer again. Perfect for small and medium businesses looking to automate Facebook, Instagram, and web chat.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-shadow flex items-center gap-2">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="px-8 py-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2">
            Watch Demo
          </button>
        </div>
        <div className="mt-16 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
          <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop" alt="Dashboard preview" className="w-full" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Everything you need to automate customer support</h2>
          <p className="text-gray-600 text-lg">Powerful features designed for busy business owners</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl mb-3">AI Auto Reply</h3>
            <p className="text-gray-600">Intelligent AI responds to customer messages instantly across all channels, 24/7.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl mb-3">Lead Capture</h3>
            <p className="text-gray-600">Automatically capture and qualify leads from every conversation with smart forms.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl mb-3">Multi-Channel Messaging</h3>
            <p className="text-gray-600">Manage Facebook Messenger, Instagram DMs, and web chat in one unified inbox.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-white rounded-3xl my-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">How it works</h2>
          <p className="text-gray-600 text-lg">Get started in 3 simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">1</div>
            <h3 className="text-xl mb-3">Connect Your Channels</h3>
            <p className="text-gray-600">Link your Facebook, Instagram, and website chat in seconds.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">2</div>
            <h3 className="text-xl mb-3">Train Your AI</h3>
            <p className="text-gray-600">Upload FAQs or enter your product info. AI learns your business instantly.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">3</div>
            <h3 className="text-xl mb-3">Start Converting</h3>
            <p className="text-gray-600">Watch AI handle customer questions and turn conversations into sales.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Loved by business owners</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"ReplyAI helped us respond to 300+ messages per day automatically. Our sales doubled in 3 months!"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full" />
                <div>
                  <div>Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Boutique Owner</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 text-lg">Choose the plan that fits your business</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Starter</div>
            <div className="text-4xl mb-1">$49<span className="text-lg text-gray-600">/mo</span></div>
            <div className="text-gray-600 mb-6">Perfect for small businesses</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> 500 conversations/mo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> 2 channels</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> AI auto-reply</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Lead capture</li>
            </ul>
            <Link to="/dashboard" className="block w-full py-3 text-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              Start Free Trial
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl shadow-2xl border-4 border-purple-400 transform scale-105 text-white">
            <div className="text-sm mb-2">Professional</div>
            <div className="text-4xl mb-1">$99<span className="text-lg opacity-80">/mo</span></div>
            <div className="opacity-90 mb-6">Most popular choice</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> 2,000 conversations/mo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Unlimited channels</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Advanced AI training</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Analytics dashboard</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Priority support</li>
            </ul>
            <Link to="/dashboard" className="block w-full py-3 text-center bg-white text-purple-600 rounded-lg hover:shadow-xl transition-shadow">
              Start Free Trial
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Enterprise</div>
            <div className="text-4xl mb-1">$249<span className="text-lg text-gray-600">/mo</span></div>
            <div className="text-gray-600 mb-6">For scaling businesses</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Unlimited conversations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Unlimited channels</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Custom AI training</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> White-label option</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Dedicated support</li>
            </ul>
            <Link to="/dashboard" className="block w-full py-3 text-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">ReplyAI</span>
              </div>
              <p className="text-gray-600 text-sm">AI-powered customer support for modern businesses.</p>
            </div>
            <div>
              <div className="mb-4">Product</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">Integrations</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-4">Company</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-4">Support</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-gray-600">
            © 2026 ReplyAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
