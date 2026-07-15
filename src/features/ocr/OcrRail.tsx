import { Link } from 'react-router-dom';
import { ChevronsRight } from 'lucide-react';
import { LogoMark } from '@/components/shell/LogoMark';
import styles from './OcrRail.module.css';

// Slim collapsed rail for the immersive processing / verification workspaces.
// The chevron returns to the digitisation queue (the main sidebar is collapsed here).
export function OcrRail() {
  return (
    <div className={styles.rail}>
      <Link to="/dashboard" className={styles.logo} aria-label="LIMS home"><LogoMark size={34} /></Link>
      <Link to="/archive/ocr" className={styles.expand} aria-label="Back to digitisation queue" title="Back to digitisation queue">
        <ChevronsRight width={18} height={18} />
      </Link>
    </div>
  );
}
