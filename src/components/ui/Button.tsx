import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'row' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
  block?: boolean;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type LinkProps = BaseProps & { to: string; onClick?: () => void };

export function Button(props: ButtonProps | LinkProps) {
  const {
    variant = 'secondary', size = 'md', leftIcon, rightIcon, children, className = '', block,
  } = props;
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${block ? styles.block : ''} ${className}`;
  const inner = (
    <>
      {leftIcon && <span className={styles.icon} aria-hidden>{leftIcon}</span>}
      {children && <span>{children}</span>}
      {rightIcon && <span className={styles.icon} aria-hidden>{rightIcon}</span>}
    </>
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cls} onClick={props.onClick}>
        {inner}
      </Link>
    );
  }
  const { to: _to, variant: _v, size: _s, leftIcon: _li, rightIcon: _ri, block: _b, className: _c, ...rest } =
    props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}
