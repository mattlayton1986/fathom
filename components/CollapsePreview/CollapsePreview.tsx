import type { ObjectNode, ArrayNode } from "@/types"
import styles from './CollapsePreview.module.scss';

interface CollapsePreviewProps {
  node: ObjectNode | ArrayNode;
}

export default function CollapsePreview({ node }: CollapsePreviewProps) {
  return (
    <span className={styles['collapse-preview']}>
      {
        node.kind === 'array'
          ? `[ ${node.childCount} items ]`
          : `{ ${node.childCount} keys }`
      }

    </span>
  );
}