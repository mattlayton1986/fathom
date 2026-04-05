'use client';

import { type Dispatch, ChangeEvent, useState } from 'react';
import { ONE_MEGABYTE, FIVE_HUNDRED_KB } from '@/lib/constants';
import styles from './JsonInput.module.scss';
import type { ParseError, ReducerAction } from '@/types';

interface JsonInputProps {
  dispatch: Dispatch<ReducerAction>,
  parseError: ParseError | null,
  rawInput: string,
}

export default function JsonInput({ dispatch, parseError, rawInput }: JsonInputProps) {
  const [jsonInput, setJsonInput] = useState<string>(rawInput);
  const [sizeWarning, setSizeWarning] = useState<string>('');

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setJsonInput(event.target.value);
  }

  function handleClear() {
    setJsonInput('');
    setSizeWarning('');
    dispatch({ type: 'CLEAR' });
  }

  function handleParse() {
    setSizeWarning('');

    const inputAsBinary = new Blob([jsonInput]);

    if (inputAsBinary.size >= ONE_MEGABYTE) {
      setSizeWarning(
        'ERROR: Input exceeds the 1MB limit and cannot be parsed. Try reducing the payload size.'
      );
      return;
    } else if (inputAsBinary.size >= FIVE_HUNDRED_KB) {
      const sizeInKB = Math.round(inputAsBinary.size / 1024);
      const percentUsed = Math.round(inputAsBinary.size / ONE_MEGABYTE * 100);
      setSizeWarning(
        `WARNING: input is ${sizeInKB} KB (${percentUsed}% of the 1MB limit). Large payloads may affect performance.`
      );
    }
    dispatch({ type: 'PARSE_JSON', rawInput: jsonInput })
  }

  return (
    <div className={styles['input-container']}>
      <textarea
        className={styles['input-field']}
        placeholder="Paste JSON here..."
        value={jsonInput}
        onChange={handleInputChange}
        aria-label="JSON input"
      />
      <div
        className={sizeWarning || parseError ? styles['input-error_container'] : undefined}
        aria-live="polite"
      >
        {sizeWarning && <p className={styles['input-error_msg']}>{sizeWarning}</p>}
        {parseError && <p className={styles['input-error_msg']}>{parseError.message}</p>}
      </div>
      <div className={styles['input-button_container']}>
        <button
          className={styles['btn-clear']}
          onClick={handleClear}
        >Clear</button>
        <button
          className={styles['btn-parse']}
          onClick={handleParse}
        >Parse</button>
      </div>
    </div>
  );
}