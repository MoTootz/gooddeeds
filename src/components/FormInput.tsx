'use client'

interface FormInputProps {
  label: string
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

export function FormInput({
  label,
  type = 'text',
  error,
  disabled = false,
  ...props
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={props.name}
        className="block text-gray-700 font-semibold mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={props.name}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
