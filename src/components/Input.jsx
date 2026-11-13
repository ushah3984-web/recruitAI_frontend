import { useId } from "react";

export default function Input({ label, error, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} {...props} />
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  );
}
