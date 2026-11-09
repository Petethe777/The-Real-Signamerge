import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import '../landing/landing.css';
import './account.css';

interface AccountShellProps {
  children: ReactNode;
  /** Optional link or button shown at the right of the header. */
  navAction?: ReactNode;
}

/** Shared page frame for the contact sales and login pages. Reuses the landing page look. */
export function AccountShell({ children, navAction }: AccountShellProps) {
  return (
    <div className="sm-landing sm-account">
      <header className="sm-nav">
        <div className="sm-nav-inner">
          <Link className="sm-logo" to="/" aria-label="Signalmerge home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Zap className="h-5 w-5 fill-white text-white" />
            </span>
            <span>Signalmerge</span>
          </Link>
          <div className="sm-nav-actions">{navAction}</div>
        </div>
      </header>
      <main className="sm-account-main">{children}</main>
    </div>
  );
}
