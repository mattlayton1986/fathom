import { useRef, useState } from 'react';
import styles from './SchemaOutput.module.scss';

interface SchemaOutputProps {
  schema: string;
  name: string;
}

export default function SchemaOutput({ schema, name }: SchemaOutputProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const handleCopy = async function () {
    await navigator.clipboard.writeText(schema);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCopied(true);

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  }

  return (
    <div className={styles['output-container']}>
      {
        schema === ''
          ? (
            <>
              <p className={styles['empty-message']}>
                Enter JSON on the Raw JSON tab to see {name} output.
              </p>
            </>
          )
          : (
            <>
              <pre className={styles['output-content']}>
                <code>
                  {schema}
                </code>
              </pre>
              <div className={styles['output-button_container']}>
                <button
                  className={styles['btn-copy']}
                  onClick={handleCopy}
                >{isCopied ? 'Copied!' : `Copy schema`}</button>
              </div>
            </>
          )
      }
    </div>
  );
}