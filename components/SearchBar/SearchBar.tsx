'use client';

import { useState } from 'react';
import styles from './SearchBar.module.scss';

export default function SearchBar() {
  const [query, setQuery] = useState('');

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
    </div>
  );
}