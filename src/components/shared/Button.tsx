import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #7C5CFC, #FC5CAD)',
    border: 'none',
    color: '#fff',
    fontWeight: 500,
  },
  secondary: {
    background: 'rgba(124,92,252,0.12)',
    border: '1px solid rgba(124,92,252,0.3)',
    color: '#A98BFC',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  danger: {
    background: 'rgba(252,92,92,0.12)',
    border: '1px solid rgba(252,92,92,0.3)',
    color: '#FC5C5C',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { fontSize: '11px', padding: '5px 12px', borderRadius: 'var(--radius-sm)' },
  md: { fontSize: '13px', padding: '7px 16px', borderRadius: 'var(--radius-md)' },
  lg: { fontSize: '14px', padding: '10px 22px', borderRadius: 'var(--radius-md)' },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  style,
  disabled,
  ...rest
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'opacity 0.15s, transform 0.15s',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button style={baseStyle} disabled={disabled || loading} {...rest}>
      {loading && (
        <span
          style={{
            width: 12,
            height: 12,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            display: 'inline-block',
          }}
          className="animate-spin"
        />
      )}
      {children}
    </button>
  );
};
