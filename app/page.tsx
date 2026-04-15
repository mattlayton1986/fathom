'use client';

import { useMemo } from 'react';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import TabPanel from '@/components/TabPanel/TabPanel';
import TreeView from '@/components/TreeView/TreeView';
import { useAppState } from '@/hooks/useAppState';
import { createTypeScriptSchema, createZodSchema } from '@/lib/schema-inference';
import styles from './page.module.scss';

export default function Home() {
  const [state, dispatch] = useAppState();

  const typescriptSchema = useMemo(() => {
    return state.tree ? createTypeScriptSchema(state.tree) : '';
  }, [state.tree]);

  const zodSchema = useMemo(() => {
    return state.tree ? createZodSchema(state.tree) : '';
  }, [state.tree]);

  return (
    <main className={styles.layout}>
      <div className={styles["panel-left"]}>
        <ThemeToggle />
        <TabPanel
          activeTab={state.ui.activeTab}
          dispatch={dispatch}
          rawInput={state.rawInput}
          parseError={state.parseError}
          typescriptSchema={typescriptSchema}
          zodSchema={zodSchema}
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
