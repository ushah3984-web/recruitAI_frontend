import { Link } from "react-router-dom";

/**
 * Shared button. Pass `to` to render a router link, otherwise a <button>.
 * variant: "primary" | "secondary" | "ghost"
 */
export default function Button({ children, to, variant = "primary", className = "", ...props }) {
  const cls = `btn btn--${variant} ${className}`.trim();
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}
