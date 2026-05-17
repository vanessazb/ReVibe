import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';

type Role = 'buyer' | 'seller';

export function Register() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<Role>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'El nombre es requerido';
    if (!email) newErrors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Correo inválido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
      toast('Cuenta creada exitosamente', 'success');
      navigate(role === 'seller' ? '/vendedor' : '/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      toast(msg.includes('already') ? 'Este correo ya está registrado' : msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-[#E8E5E0]">
            <div className="text-center mb-8">
              <Link to="/">
                <span className="font-serif text-4xl font-bold text-[#1A1A1A]">ReVibe</span>
              </Link>
              <p className="mt-2 text-sm text-[#6B6B6B]">Segunda mano. Primera clase.</p>
            </div>

            <h1 className="text-xl font-semibold text-[#1A1A1A] mb-2">Crea tu cuenta</h1>
            <p className="text-sm text-[#6B6B6B] mb-6">¿Cómo quieres usar ReVibe?</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={clsx(
                  'p-5 rounded-lg border-2 text-left transition-all duration-200',
                  role === 'buyer'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#E8E5E0] hover:border-[#C8B89A]'
                )}
              >
                <span className="text-3xl mb-3 block">🛍️</span>
                <p className="font-semibold text-sm mb-1">Comprador</p>
                <p className={clsx('text-xs leading-relaxed', role === 'buyer' ? 'text-white/70' : 'text-[#6B6B6B]')}>
                  Descubre y compra prendas únicas
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('seller')}
                className={clsx(
                  'p-5 rounded-lg border-2 text-left transition-all duration-200',
                  role === 'seller'
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#E8E5E0] hover:border-[#C8B89A]'
                )}
              >
                <span className="text-3xl mb-3 block">👗</span>
                <p className="font-semibold text-sm mb-1">Vendedor</p>
                <p className={clsx('text-xs leading-relaxed', role === 'seller' ? 'text-white/70' : 'text-[#6B6B6B]')}>
                  Vende tu ropa y gana dinero
                </p>
              </button>
            </div>

            <Button fullWidth size="lg" onClick={() => setStep('form')}>
              Continuar como {role === 'buyer' ? 'comprador' : 'vendedor'}
            </Button>

            <div className="mt-6 pt-6 border-t border-[#E8E5E0] text-center">
              <p className="text-sm text-[#6B6B6B]">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-[#1A1A1A] font-medium hover:text-[#C8B89A] transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-[#E8E5E0]">
          <div className="text-center mb-8">
            <Link to="/">
              <span className="font-serif text-4xl font-bold text-[#1A1A1A]">ReVibe</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setStep('role')}
              className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A1A]">
                Regístrate como {role === 'buyer' ? 'comprador' : 'vendedor'}
              </h1>
              <p className="text-sm text-[#6B6B6B]">Completa tus datos para comenzar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              error={errors.fullName}
              autoComplete="name"
            />
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
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Crear cuenta
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E5E0] text-center">
            <p className="text-sm text-[#6B6B6B]">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#1A1A1A] font-medium hover:text-[#C8B89A] transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
