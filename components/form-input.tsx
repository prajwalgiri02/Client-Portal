import type { InputHTMLAttributes } from "react"

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function FormInput({ label, error, id, ...props }: FormInputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-3 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? "border-red-500 focus:ring-red-500" : "border-muted"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
