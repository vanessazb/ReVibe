import clsx from 'clsx';

interface BadgeProps {
  variant?: 'disponible' | 'vendida' | 'nueva' | 'en_revision' | 'pausada' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
        {
          'bg-[#2D7A4F]/10 text-[#2D7A4F] border border-[#2D7A4F]/20': variant === 'disponible',
          'bg-[#9B9B9B]/10 text-[#9B9B9B] border border-[#9B9B9B]/20': variant === 'vendida',
          'bg-[#C8B89A]/20 text-[#A09070] border border-[#C8B89A]/40':
            variant === 'nueva' || variant === 'default',
          'bg-amber-50 text-amber-700 border border-amber-200': variant === 'en_revision',
          'bg-[#F5F3F0] text-[#6B6B6B] border border-[#E8E5E0]': variant === 'pausada',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
