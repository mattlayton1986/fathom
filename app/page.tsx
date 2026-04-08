'use client';

import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import JsonInput from '@/components/JsonInput/JsonInput';
import TreeView from '@/components/TreeView/TreeView';
import { useAppState } from '@/hooks/useAppState';
import styles from './page.module.scss';

export default function Home() {
  const [state, dispatch] = useAppState();
  return (
    <main className={styles.layout}>
      <div className={styles["panel-left"]}>
        <ThemeToggle />
        <JsonInput
          dispatch={dispatch}
          parseError={state.parseError}
          rawInput={state.rawInput}
        />
      </div>
      <div className={styles["panel-right"]}>
        <TreeView
          dispatch={dispatch}
          tree={state.tree}
          ui={state.ui}
        />
      </div>
    </main>
  );
}
