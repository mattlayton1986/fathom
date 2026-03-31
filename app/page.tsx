import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import styles from './page.module.scss';

export default function Home() {
  return (
    <main className={styles.layout}>
      <div className={styles["panel-left"]}>
        <ThemeToggle />
      </div>
      <div className={styles["panel-right"]}>

      </div>
    </main>
  );
}
