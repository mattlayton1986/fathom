'use client';

import { type Dispatch, useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import type { ReducerAction } from '@/types';
import styles from './SearchBar.module.scss';

type SearchBarProps = {
  dispatch: Dispatch<ReducerAction>;
}

export default function SearchBar({ dispatch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    dispatch({
      type: 'SET_SEARCH',
      query: debouncedQuery,
    });
  }, [debouncedQuery, dispatch]);

  const handleClearSearch = () => {
    setQuery('');
    dispatch({ type: 'SET_SEARCH', query: '' });
  };

  return (
    <div className={styles['tree-search']}>
      <label htmlFor="tree-search">Search JSON</label>
      <input
        id="tree-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search in JSON"
      />
      {query !== '' && (
        <button
          type="button"
          className={styles['clear-button']}
          aria-label="Clear search"
          onClick={handleClearSearch}
        >
          ×
        </button>
      )}
    </div>
  );
}