import { useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/formatters';
import clsx from 'clsx';

const DEMO_USERS = [
  { id: 'admin1', email: 'admin@revibe.co', full_name: 'Carlos Admin', city: 'Bogotá', role: 'admin', created_at: '2024-01-01T00:00:00Z', active: true },
  { id: 'seller1', email: 'vendedor@revibe.co', full_name: 'Valentina Morales', city: 'Medellín', role: 'seller', created_at: '2024-02-15T00:00:00Z', active: true },
  { id: 'seller2', email: 'moda@revibe.co', full_name: 'Camila Torres', city: 'Bogotá', role: 'seller', created_at: '2024-03-10T00:00:00Z', active: true },
  { id: 'buyer1', email: 'ana@gmail.com', full_name: 'Ana García', city: 'Bogotá', role: 'buyer', created_at: '2024-04-05T00:00:00Z', active: true },
  { id: 'buyer2', email: 'maria@gmail.com', full_name: 'María Jiménez', city: 'Medellín', role: 'buyer', created_at: '2024-05-20T00:00:00Z', active: true },
  { id: 'buyer3', email: 'sofia@gmail.com', full_name: 'Sofía Pérez', city: 'Cali', role: 'buyer', created_at: '2024-06-12T00:00:00Z', active: true },
  { id: 'seller3', email: 'fashion@revibe.co', full_name: 'Laura Ríos', city: 'Cali', role: 'seller', created_at: '2024-07-08T00:00:00Z', active: false },
];

const ROLE_TABS = [
  { value: '', label: 'Todos' },
  { value: 'buyer', label: 'Compradores' },
  { value: 'seller', label: 'Vendedores' },
  { value: 'admin', label: 'Admins' },
];

export function UsersManager() {
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(DEMO_USERS);
  const { toast } = useToast();

  let filtered = [...users];
  if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.city || '').toLowerCase().includes(search.toLowerCase())
    );
  }

  const toggleActive = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
    const user = users.find((u) => u.id === userId);
    toast(
      user?.active ? 'Usuario suspendido' : 'Usuario reactivado',
      user?.active ? 'info' : 'success'
    );
  };

  const changeRole = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast('Rol actualizado', 'success');
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[#E8E5E0] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleFilter(tab.value)}
            className={clsx(
              'px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors',
              roleFilter === tab.value
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#6B6B6B] hover:bg-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { role: 'buyer', label: 'Compradores', count: users.filter((u) => u.role === 'buyer').length },
          { role: 'seller', label: 'Vendedores', count: users.filter((u) => u.role === 'seller').length },
          { role: 'admin', label: 'Admins', count: users.filter((u) => u.role === 'admin').length },
        ].map((s) => (
          <div key={s.role} className="bg-white border border-[#E8E5E0] rounded-lg p-4 text-center shadow-sm">
            <p className="font-mono text-2xl font-bold text-[#1A1A1A]">{s.count}</p>
            <p className="text-xs text-[#6B6B6B] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E5E0] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#E8E5E0]">
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Ciudad</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Registro</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5E0]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#F5F3F0] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-[#1A1A1A] truncate">{user.full_name}</p>
                        <p className="text-xs text-[#6B6B6B] truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="text-xs border border-[#E8E5E0] rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#C8B89A] cursor-pointer"
                    >
                      <option value="buyer">Comprador</option>
                      <option value="seller">Vendedor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{user.city || '—'}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs rounded font-medium ${
                        user.active
                          ? 'bg-[#2D7A4F]/10 text-[#2D7A4F]'
                          : 'bg-[#C0392B]/10 text-[#C0392B]'
                      }`}
                    >
                      {user.active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(user.id)}
                      className={`text-xs px-2.5 py-1 rounded transition-colors ${
                        user.active
                          ? 'bg-[#C0392B]/10 text-[#C0392B] hover:bg-[#C0392B]/20'
                          : 'bg-[#2D7A4F]/10 text-[#2D7A4F] hover:bg-[#2D7A4F]/20'
                      }`}
                    >
                      {user.active ? 'Suspender' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
