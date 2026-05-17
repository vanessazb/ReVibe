import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../lib/formatters';
import { DEMO_GARMENTS, DEMO_ORDERS } from '../../lib/demoData';
import { InventoryManager } from './InventoryManager';
import { SalesHistory } from './SalesHistory';
import { UsersManager } from './UsersManager';
import clsx from 'clsx';
// @ts-ignore
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WEEKLY_DATA = [
  { week: 'S1', prendas: 4, ventas: 2 },
  { week: 'S2', prendas: 7, ventas: 5 },
  { week: 'S3', prendas: 3, ventas: 6 },
  { week: 'S4', prendas: 10, ventas: 8 },
  { week: 'S5', prendas: 6, ventas: 4 },
  { week: 'S6', prendas: 12, ventas: 9 },
  { week: 'S7', prendas: 8, ventas: 11 },
];

const CATEGORY_DATA = [
  { categoria: 'Superiores', ventas: 45 },
  { categoria: 'Inferiores', ventas: 28 },
  { categoria: 'Vestidos', ventas: 32 },
  { categoria: 'Accesorios', ventas: 18 },
];

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/inventario', label: 'Inventario', icon: '📦' },
  { path: '/admin/ventas', label: 'Ventas', icon: '💰' },
  { path: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
];

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalRevenue = DEMO_ORDERS.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingReview = DEMO_GARMENTS.filter((g) => g.status === 'en_revision').length;

  const kpis = [
    { label: 'Prendas totales', value: DEMO_GARMENTS.length.toString(), trend: '+12%', positive: true },
    { label: 'Ventas este mes', value: DEMO_ORDERS.length.toString(), trend: '+8%', positive: true },
    { label: 'Ingresos COP', value: formatCOP(totalRevenue), trend: '+15%', positive: true },
    { label: 'En revisión', value: pendingReview.toString(), trend: `${pendingReview} pendientes`, positive: false },
  ];

  const currentPath = location.pathname;
  const getContent = () => {
    if (currentPath === '/admin/inventario') return <InventoryManager />;
    if (currentPath === '/admin/ventas') return <SalesHistory />;
    if (currentPath === '/admin/usuarios') return <UsersManager />;
    return null; // main dashboard
  };
  const isMainDashboard = currentPath === '/admin';

  const Sidebar = () => (
    <aside className={clsx(
      'w-64 bg-[#1A1A1A] text-white flex flex-col flex-shrink-0',
      'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="p-6 border-b border-white/10">
        <span className="font-serif text-2xl font-bold">ReVibe</span>
        <p className="text-xs text-white/50 mt-1">Panel de administración</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
              currentPath === item.path
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#C8B89A] flex items-center justify-center text-sm font-bold">
            {profile?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-white/50 truncate">{profile?.email || 'admin@revibe.co'}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full text-left text-xs text-white/50 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F3F0]">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-[#E8E5E0] px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="font-semibold text-[#1A1A1A]">
            {NAV_ITEMS.find((n) => n.path === currentPath)?.label || 'Dashboard'}
          </h2>
          {pendingReview > 0 && isMainDashboard && (
            <Link
              to="/admin/inventario"
              className="ml-auto flex items-center gap-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded"
            >
              ⚠️ {pendingReview} prendas pendientes de revisión
            </Link>
          )}
        </div>

        <div className="p-6">
          {isMainDashboard ? (
            <>
              {/* Pending review banner */}
              {pendingReview > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600">⚠️</span>
                    <p className="text-sm text-amber-700 font-medium">
                      {pendingReview} prenda{pendingReview !== 1 ? 's' : ''} pendiente{pendingReview !== 1 ? 's' : ''} de revisión
                    </p>
                  </div>
                  <Link to="/admin/inventario" className="text-xs text-amber-700 underline hover:no-underline">
                    Revisar ahora
                  </Link>
                </div>
              )}

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
                    <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2">{kpi.label}</p>
                    <p className="font-mono text-xl font-bold text-[#1A1A1A] mb-1">{kpi.value}</p>
                    <p className={`text-xs ${kpi.positive ? 'text-[#2D7A4F]' : 'text-amber-600'}`}>
                      {kpi.trend}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
                  <h3 className="font-semibold text-[#1A1A1A] mb-4">Publicaciones por semana</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={WEEKLY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="prendas" stroke="#1A1A1A" strokeWidth={2} dot={false} name="Prendas" />
                      <Line type="monotone" dataKey="ventas" stroke="#C8B89A" strokeWidth={2} dot={false} name="Ventas" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm">
                  <h3 className="font-semibold text-[#1A1A1A] mb-4">Ventas por categoría</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={CATEGORY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="ventas" fill="#1A1A1A" radius={[4, 4, 0, 0]} name="Ventas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { to: '/admin/inventario', icon: '📦', title: 'Revisar inventario', desc: `${pendingReview} prendas pendientes` },
                  { to: '/admin/ventas', icon: '💰', title: 'Ver ventas', desc: `${DEMO_ORDERS.length} órdenes totales` },
                  { to: '/admin/usuarios', icon: '👥', title: 'Gestionar usuarios', desc: 'Compradores y vendedores' },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="bg-white border border-[#E8E5E0] rounded-lg p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
                  >
                    <span className="text-2xl block mb-2">{action.icon}</span>
                    <p className="font-semibold text-[#1A1A1A] group-hover:text-[#C8B89A] transition-colors">
                      {action.title}
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-1">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            getContent()
          )}
        </div>
      </div>
    </div>
  );
}
