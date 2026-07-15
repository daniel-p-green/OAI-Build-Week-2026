import {
  type AnchorHTMLAttributes,
  forwardRef,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";

export { DOMAIN_UI_EXCEPTIONS, OAI_UI_COMPONENTS, OAI_UI_SOURCE, OAI_UI_TOKENS } from "./contract.js";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function FullScreenShell({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <main className={classes("oai-full-screen", className)} data-oai-component="FullScreenShell" {...props} />;
}

export function NavigationHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={classes("oai-navigation-header", className)} data-oai-component="NavigationHeader" {...props} />;
}

export type ButtonVariant = "primary" | "secondary" | "destructive" | "secondary-destructive";
export type ButtonSize = "large" | "small";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }>(
  function Button({ className, variant = "primary", size = "large", type = "button", ...props }, ref) {
    return <button ref={ref} type={type} className={classes("oai-button", `oai-button--${variant}`, `oai-button--${size}`, className)} data-oai-component="Button" {...props} />;
  },
);

export const ButtonLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize }>(
  function ButtonLink({ className, variant = "primary", size = "large", ...props }, ref) {
    return <a ref={ref} className={classes("oai-button", `oai-button--${variant}`, `oai-button--${size}`, className)} data-oai-component="ButtonLink" {...props} />;
  },
);

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tooltip?: string }>(
  function IconButton({ className, label, tooltip = label, type = "button", children, ...props }, ref) {
    return (
      <button ref={ref} type={type} className={classes("oai-icon-button", className)} aria-label={label} data-oai-component="IconButton" {...props}>
        {children}
        <span className="oai-tooltip" role="tooltip">{tooltip}</span>
      </button>
    );
  },
);

export const Token = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function Token({ className, type = "button", ...props }, ref) {
    return <button ref={ref} type={type} className={classes("oai-token", className)} data-oai-component="Token" {...props} />;
  },
);

function setForwardedRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { indeterminate?: boolean }>(
  function Checkbox({ className, indeterminate = false, ...props }, forwardedRef) {
    const localRef = useRef<HTMLInputElement | null>(null);
    const ref = useCallback((node: HTMLInputElement | null) => {
      localRef.current = node;
      setForwardedRef(forwardedRef, node);
    }, [forwardedRef]);
    useEffect(() => {
      if (localRef.current) localRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    return <input ref={ref} type="checkbox" className={classes("oai-checkbox", className)} data-indeterminate={indeterminate || undefined} aria-checked={indeterminate ? "mixed" : undefined} data-oai-component="Checkbox" {...props} />;
  },
);

type FieldProps = { label?: string; hint?: string; error?: string };

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ className, label, hint, error, id, ...props }, ref) {
    const field = <input ref={ref} id={id} className={classes("oai-input", error && "is-error", className)} aria-invalid={Boolean(error)} data-oai-component="Input" {...props} />;
    if (!label && !hint && !error) return field;
    return <label className="oai-field"><span>{label}</span>{field}{(error || hint) && <small>{error || hint}</small>}</label>;
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  function TextArea({ className, label, hint, error, id, ...props }, ref) {
    const field = <textarea ref={ref} id={id} className={classes("oai-textarea", error && "is-error", className)} aria-invalid={Boolean(error)} data-oai-component="TextArea" {...props} />;
    if (!label && !hint && !error) return field;
    return <label className="oai-field"><span>{label}</span>{field}{(error || hint) && <small>{error || hint}</small>}</label>;
  },
);

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={classes("oai-card", className)} data-oai-component="Card" {...props} />;
}

export function ListGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("oai-list-group", className)} data-oai-component="ListGroup" {...props} />;
}

export function ListRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("oai-list-row", className)} data-oai-component="ListRow" {...props} />;
}

export const ListRowAction = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ListRowAction({ className, type = "button", ...props }, ref) {
    return <button ref={ref} type={type} className={classes("oai-list-row-action", className)} data-oai-component="ListRowAction" {...props} />;
  },
);

export function EntityCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={classes("oai-entity-card", className)} data-oai-component="EntityCard" {...props} />;
}

export const EntityCardAction = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function EntityCardAction({ className, type = "button", ...props }, ref) {
    return <button ref={ref} type={type} className={classes("oai-entity-card", "oai-entity-card-action", className)} data-oai-component="EntityCardAction" {...props} />;
  },
);

export function Carousel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={classes("oai-carousel", className)} data-oai-component="Carousel" {...props} />;
}

export function CarouselRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("oai-carousel-row", className)} data-oai-component="CarouselRow" {...props} />;
}

export function SideSheet({ title, onClose, className, children, ...props }: HTMLAttributes<HTMLElement> & { title: string; onClose: () => void }) {
  return <aside className={classes("oai-side-sheet", className)} role="dialog" aria-modal="true" aria-label={title} data-oai-component="SideSheet" {...props}><header><h2>{title}</h2><IconButton label={`Close ${title}`} onClick={onClose}><CloseIcon /></IconButton></header>{children}</aside>;
}

export function ArrowLeftIcon() {
  return <svg className="oai-icon" data-figma-node="2105:819" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z" /></svg>;
}

export function CloseIcon() {
  return <svg className="oai-icon" data-figma-node="2105:904" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.63604 5.63604C6.02656 5.24551 6.65973 5.24551 7.05025 5.63604L12 10.5858L16.9497 5.63604C17.3403 5.24551 17.9734 5.24551 18.364 5.63604C18.7545 6.02656 18.7545 6.65973 18.364 7.05025L13.4142 12L18.364 16.9497C18.7545 17.3403 18.7545 17.9734 18.364 18.364C17.9734 18.7545 17.3403 18.7545 16.9497 18.364L12 13.4142L7.05025 18.364C6.65973 18.7545 6.02656 18.7545 5.63604 18.364C5.24551 17.9734 5.24551 17.3403 5.63604 16.9497L10.5858 12L5.63604 7.05025C5.24551 6.65973 5.24551 6.02656 5.63604 5.63604Z" /></svg>;
}

export function PlusIcon() {
  return <svg className="oai-icon" data-figma-node="2105:886" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C12.5523 3 13 3.44772 13 4L13 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L13 13L13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20L11 13L4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11L11 11L11 4C11 3.44772 11.4477 3 12 3Z" /></svg>;
}

export function FileIcon({ label }: { label?: string }) {
  return <span className="oai-file-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20.5H7z" /><path d="M14 3.5v4h4" /></svg>{label && <small>{label}</small>}</span>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="oai-field-label">{children}</span>;
}
