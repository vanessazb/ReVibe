interface AvatarProps {
  name?: string | null;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, url, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  if (url) {
    return (
      <img
        src={url}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#C8B89A] text-white flex items-center justify-center font-semibold`}
    >
      {initials}
    </div>
  );
}
