'use client';

import { useEffect, useMemo, useRef } from 'react';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import TabPanel from '@/components/TabPanel/TabPanel';
import SearchBar from '@/components/SearchBar/SearchBar';
import TreeView from '@/components/TreeView/TreeView';
import { useAppState } from '@/hooks/useAppState';
import { createTypeScriptSchema, createZodSchema } from '@/lib/schema-inference';
import styles from './page.module.scss';

export default function Home() {
  const [state, dispatch] = useAppState();
  const treePanelRef = useRef<HTMLDivElement>(null);

  const typescriptSchema = useMemo(() => {
    return state.tree ? createTypeScriptSchema(state.tree) : '';
  }, [state.tree]);

  const zodSchema = useMemo(() => {
    return state.tree ? createZodSchema(state.tree) : '';
  }, [state.tree]);

  useEffect(() => {
    if (!state.tree
      || !window.matchMedia('(max-width: 768px)').matches
    ) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    treePanelRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
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
      <div ref={treePanelRef} className={styles["panel-right"]}>
        <SearchBar dispatch={dispatch} />
        <TreeView
          dispatch={dispatch}
          tree={state.tree}
          ui={state.ui}
          parseError={state.parseError}
        />
      </div>
    </main>
  );
}
