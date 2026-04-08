import styles from './TypeBadge.module.scss';

type Props = {
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
}

export default function TypeBadge({ type }: Props) {
  return (
    <span
      className={styles.badge}
      data-type={type}
      aria-label={`type: ${type}`}
    >
      {type}
    </span>
  );
}