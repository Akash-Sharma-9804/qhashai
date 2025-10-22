import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput - A reusable password input component with visibility toggle
 * @param {Object} props - Component props
 * @param {string} props.value - Current password value
 * @param {Function} props.onChange - Function to handle value changes
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} [props.className] - Additional CSS classes for the input
 * @param {Object} [props.inputProps] - Additional props to pass to the input element
 */
const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  inputProps = {} 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input 
        type={showPassword ? "text" : "password"} 
        placeholder={placeholder} 
        className={`w-full px-4 py-2 border rounded-lg placeholder:text-xs placeholder:md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
        value={value} 
        onChange={onChange}
        {...inputProps}
      />
      <button 
        type="button"
        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default PasswordInput;