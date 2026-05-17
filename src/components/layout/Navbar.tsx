import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Avatar } from '../ui/Avatar';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'seller') return '/vendedor';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E5E0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 text-[#1A1A1A] hover:bg-[#F5F3F0] rounded"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="font-serif text-2xl font-bold text-[#1A1A1A] tracking-tight flex-shrink-0">
            ReVibe
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 ml-10">
            <Link to="/catalogo?gender=mujer" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C8B89A] transition-colors">
              Mujer
            </Link>
            <Link to="/catalogo?gender=hombre" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C8B89A] transition-colors">
              Hombre
            </Link>
            <Link to="/catalogo?category=accesorios" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C8B89A] transition-colors">
              Accesorios
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar prendas..."
                  className="border border-[#E8E5E0] rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-2 p-1.5 text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#1A1A1A] hover:bg-[#F5F3F0] rounded transition-colors"
                aria-label="Buscar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Cart */}
            <Link
              to="/carrito"
              className="relative p-2 text-[#1A1A1A] hover:bg-[#F5F3F0] rounded transition-colors"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1A1A1A] text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-[#F5F3F0] transition-colors"
                >
                  <Avatar name={profile?.full_name} url={profile?.avatar_url} size="sm" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E5E0] rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#E8E5E0]">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {profile?.full_name || 'Usuario'}
                      </p>
                      <p className="text-xs text-[#6B6B6B] truncate">{profile?.email}</p>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mi panel
                    </Link>
                    {profile?.role === 'seller' && (
                      <Link
                        to="/vendedor/consignar"
                        className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Consignar prenda
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-[#C0392B] hover:bg-[#F5F3F0] transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium bg-[#1A1A1A] text-white rounded hover:bg-[#333] transition-colors"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E5E0]">
              <span className="font-serif text-2xl font-bold text-[#1A1A1A]">ReVibe</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearch} className="p-4 border-b border-[#E8E5E0]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar prendas..."
                  className="flex-1 border border-[#E8E5E0] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B89A]"
                />
                <button type="submit" className="p-2 bg-[#1A1A1A] text-white rounded">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <nav className="flex-1 p-4 space-y-1">
              <Link
                to="/catalogo?gender=mujer"
                className="block px-3 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mujer
              </Link>
              <Link
                to="/catalogo?gender=hombre"
                className="block px-3 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hombre
              </Link>
              <Link
                to="/catalogo?category=accesorios"
                className="block px-3 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accesorios
              </Link>
              <Link
                to="/catalogo"
                className="block px-3 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F3F0] rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Todo el catálogo
              </Link>
            </nav>

            <div className="p-4 border-t border-[#E8E5E0]">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 p-3 bg-[#F5F3F0] rounded-lg mb-2">
                    <Avatar name={profile?.full_name} url={profile?.avatar_url} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {profile?.full_name || 'Usuario'}
                      </p>
                      <p className="text-xs text-[#6B6B6B] truncate">{profile?.email}</p>
                    </div>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    className="block px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi panel
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-[#C0392B] hover:bg-[#F5F3F0] rounded"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded hover:bg-[#333] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ingresar
                  </Link>
                  <Link
                    to="/registro"
                    className="block w-full text-center py-2.5 border border-[#1A1A1A] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#F5F3F0] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
