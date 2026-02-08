import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowLeftRight,
  Globe2,
  DollarSign,
  Banknote,
  Shield,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wallets', icon: Wallet, label: 'Wallets' },
  { to: '/send', icon: ArrowUpRight, label: 'Send' },
  { to: '/swap', icon: ArrowLeftRight, label: 'Swap' },
  { to: '/bridge', icon: Globe2, label: 'Bridge' },
  { to: '/buy', icon: DollarSign, label: 'Buy Crypto' },
  { to: '/sell', icon: Banknote, label: 'Sell Crypto' },
  { to: '/recovery', icon: Shield, label: 'Recovery' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Panoplia</h1>
            <p className="text-xs text-slate-500">MPC Wallet</p>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="px-4 pt-4">
        <NavLink
          to="/create-wallet"
          className="flex items-center gap-2 w-full btn-primary text-sm justify-center"
        >
          <Plus className="w-4 h-4" />
          New Wallet
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
