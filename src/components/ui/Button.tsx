interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'px-4 py-2 text-sm rounded cursor-pointer transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-zinc-200 text-black hover:bg-zinc-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    icon: 'bg-transparent text-zinc-400 hover:text-zinc-600 p-1',
  };


  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
