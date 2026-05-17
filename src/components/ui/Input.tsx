import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]">{icon}</span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full border rounded px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6B6B] transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#C8B89A] focus:border-[#C8B89A]',
            error ? 'border-[#C0392B]' : 'border-[#E8E5E0]',
            icon ? 'pl-9' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#C0392B]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export function Textarea({
  label,
  error,
  className,
  id,
  maxLength,
  currentLength,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        maxLength={maxLength}
        className={clsx(
          'w-full border rounded px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6B6B] transition-all duration-200 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[#C8B89A] focus:border-[#C8B89A]',
          error ? 'border-[#C0392B]' : 'border-[#E8E5E0]',
          className
        )}
        {...props}
      />
      <div className="flex justify-between">
        {error && <p className="text-xs text-[#C0392B]">{error}</p>}
        {maxLength && (
          <p className="text-xs text-[#6B6B6B] ml-auto">
            {currentLength ?? 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, className, id, options, placeholder, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          'w-full border rounded px-3 py-2.5 text-sm text-[#1A1A1A] bg-white transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#C8B89A] focus:border-[#C8B89A]',
          error ? 'border-[#C0392B]' : 'border-[#E8E5E0]',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#C0392B]">{error}</p>}
    </div>
  );
}
