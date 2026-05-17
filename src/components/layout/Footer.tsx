import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-serif text-3xl font-bold text-white">ReVibe</span>
            <p className="mt-3 text-sm text-[#9B9B9B] leading-relaxed">
              La plataforma colombiana de moda circular. Compra y vende ropa de segunda mano con
              estilo.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-[#9B9B9B] hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-[#9B9B9B] hover:text-white transition-colors" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.16 8.16 0 004.77 1.53V6.82a4.83 4.83 0 01-1-.13z" />
                </svg>
              </a>
              <a href="#" className="text-[#9B9B9B] hover:text-white transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Comprar */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C8B89A] mb-4">
              Comprar
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/catalogo?gender=mujer" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Mujer
                </Link>
              </li>
              <li>
                <Link to="/catalogo?gender=hombre" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Hombre
                </Link>
              </li>
              <li>
                <Link to="/catalogo?category=accesorios" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Novedades
                </Link>
              </li>
            </ul>
          </div>

          {/* Vender */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C8B89A] mb-4">
              Vender
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/registro" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Crea tu cuenta
                </Link>
              </li>
              <li>
                <Link to="/vendedor/consignar" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Consignar prenda
                </Link>
              </li>
              <li>
                <Link to="/vendedor" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Mi panel vendedor
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#C8B89A] mb-4">
              Ayuda
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Envíos y devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#9B9B9B] hover:text-white transition-colors">
                  Contáctanos
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B6B6B]">
            © 2025 ReVibe. Todos los derechos reservados. Hecho con amor en Colombia 🇨🇴
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-[#6B6B6B] hover:text-white transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-xs text-[#6B6B6B] hover:text-white transition-colors">
              Política de privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
