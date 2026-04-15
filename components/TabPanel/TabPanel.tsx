import { Dispatch } from "react";
import JsonInput from "../JsonInput/JsonInput";
import SchemaOutput from "../SchemaOutput/SchemaOutput";
import { ReducerAction, AppState } from "@/types";
import styles from './TabPanel.module.scss';

interface TabPanelProps {
  activeTab: AppState['ui']['activeTab'];
  dispatch: Dispatch<ReducerAction>;
  rawInput: AppState['rawInput'];
  parseError: AppState['parseError'];
  typescriptSchema: string;
  zodSchema: string;
}

export default function TabPanel({
  activeTab,
  dispatch,
  rawInput,
  parseError,
  typescriptSchema,
  zodSchema,
}: TabPanelProps) {

  const handleTab = (currentTab: AppState['ui']['activeTab']) => {
    dispatch({
      type: 'SET_ACTIVE_TAB',
      activeTab: currentTab,
    })
  }

  return (
    <div className={styles['tabpanel']}>
      <div role="tablist" className={styles['tabpanel-tablist']}>
        <button
          type="button"
          role="tab"
          id="tab-raw"
          data-active={activeTab === 'raw'}
          className={styles['tabpanel-tab']}
          aria-selected={activeTab === 'raw'}
          aria-controls="panel-raw"
          onClick={() => handleTab('raw')}
        >Raw JSON</button>
        <button
          type="button"
          role="tab"
          id="tab-ts"
          data-active={activeTab === 'typescript'}
          className={styles['tabpanel-tab']}
          aria-selected={activeTab === 'typescript'}
          aria-controls="panel-ts"
          onClick={() => handleTab('typescript')}
        >TypeScript</button>
        <button
          type="button"
          role="tab"
          id="tab-zod"
          data-active={activeTab === 'zod'}
          className={styles['tabpanel-tab']}
          aria-selected={activeTab === 'zod'}
          aria-controls="panel-zod"
          onClick={() => handleTab('zod')}
        >Zod</button>
      </div>

      <div
        role="tabpanel"
        id="panel-raw"
        aria-labelledby="tab-raw"
        hidden={activeTab !== 'raw'}
        className={styles['tabpanel-panel']}
      >
        <JsonInput dispatch={dispatch} rawInput={rawInput} parseError={parseError} />
      </div>
      <div
        role="tabpanel"
        id="panel-ts"
        aria-labelledby="tab-ts"
        hidden={activeTab !== 'typescript'}
        className={styles['tabpanel-panel']}
      >
        <SchemaOutput schema={typescriptSchema} name='TypeScript' />
      </div>
      <div
        role="tabpanel"
        id="panel-zod"
        aria-labelledby="tab-zod"
        hidden={activeTab !== 'zod'}
        className={styles['tabpanel-panel']}
      >
        <SchemaOutput schema={zodSchema} name='Zod' />
      </div>
    </div>
  );
}