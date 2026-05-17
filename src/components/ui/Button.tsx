import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-[#1A1A1A] text-white hover:bg-[#333] focus:ring-[#1A1A1A]': variant === 'primary',
          'border border-[#1A1A1A] text-[#1A1A1A] bg-transparent hover:bg-[#1A1A1A] hover:text-white focus:ring-[#1A1A1A]':
            variant === 'secondary',
          'text-[#1A1A1A] bg-transparent hover:bg-[#F5F3F0] focus:ring-[#C8B89A]': variant === 'ghost',
          'bg-[#C0392B] text-white hover:bg-[#a93226] focus:ring-[#C0392B]': variant === 'danger',
          'px-3 py-1.5 text-sm rounded': size === 'sm',
          'px-4 py-2.5 text-sm rounded': size === 'md',
          'px-6 py-3 text-base rounded': size === 'lg',
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
