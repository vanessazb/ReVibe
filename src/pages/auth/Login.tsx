import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Correo inválido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Bienvenido de vuelta', 'success');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      toast(msg.includes('Invalid') ? 'Correo o contraseña incorrectos' : msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-[#E8E5E0]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/">
              <span className="font-serif text-4xl font-bold text-[#1A1A1A]">ReVibe</span>
            </Link>
            <p className="mt-2 text-sm text-[#6B6B6B]">Segunda mano. Primera clase.</p>
          </div>

          <h1 className="text-xl font-semibold text-[#1A1A1A] mb-6">Inicia sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <a href="#" className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E5E0] text-center">
            <p className="text-sm text-[#6B6B6B]">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#1A1A1A] font-medium hover:text-[#C8B89A] transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#6B6B6B] mt-4">
          Al ingresar, aceptas nuestros{' '}
          <a href="#" className="underline">
            Términos de uso
          </a>{' '}
          y{' '}
          <a href="#" className="underline">
            Política de privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
