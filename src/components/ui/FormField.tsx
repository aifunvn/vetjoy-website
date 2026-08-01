import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldBase =
  "focus-ring w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 disabled:bg-neutral-100";
const fieldError = "border-danger-500";

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-neutral-800">
      {children}
      {required ? <span className="text-danger-500"> *</span> : null}
    </label>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-danger-700">
      {error}
    </p>
  );
}

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function TextField({
  id,
  label,
  required,
  error,
  hint,
  className = "",
  ...props
}: FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {hint ? <p className="mb-1.5 text-xs text-neutral-500">{hint}</p> : null}
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`${fieldBase} ${error ? fieldError : ""}`}
        {...props}
      />
      <ErrorText id={errorId} error={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  required,
  error,
  hint,
  className = "",
  rows = 4,
  ...props
}: FieldWrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {hint ? <p className="mb-1.5 text-xs text-neutral-500">{hint}</p> : null}
      <textarea
        id={id}
        name={id}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`${fieldBase} ${error ? fieldError : ""}`}
        {...props}
      />
      <ErrorText id={errorId} error={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  required,
  error,
  hint,
  className = "",
  children,
  ...props
}: FieldWrapperProps &
  SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {hint ? <p className="mb-1.5 text-xs text-neutral-500">{hint}</p> : null}
      <select
        id={id}
        name={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`${fieldBase} ${error ? fieldError : ""}`}
        {...props}
      >
        {children}
      </select>
      <ErrorText id={errorId} error={error} />
    </div>
  );
}

export function CheckboxField({
  id,
  label,
  error,
  className = "",
  ...props
}: {
  id: string;
  label: ReactNode;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="focus-ring mt-1 h-5 w-5 shrink-0 rounded border-neutral-400 text-brand-green-600"
          {...props}
        />
        <label htmlFor={id} className="text-sm text-neutral-700">
          {label}
        </label>
      </div>
      <ErrorText id={errorId} error={error} />
    </div>
  );
}
