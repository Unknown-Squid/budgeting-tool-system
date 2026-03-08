export default function Button({ 
  children, 
  type = 'button', 
  onClick, 
  disabled = false, 
  variant = 'primary',
  className = '',
  fullWidth = false 
}) {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400',
    link: 'bg-transparent text-blue-600 hover:text-blue-700 p-0',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
