export default function InputField({ label, type = 'text', placeholder, value, onChange, required = false, disabled = false, min, step, className = '', title }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        step={step}
        title={title}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500 ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''} ${className}`}
      />
    </div>
  );
}
