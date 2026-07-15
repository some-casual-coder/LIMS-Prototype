import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Panel, Button, StatusBadge } from '@/components/ui';
import { ShelledPage } from '@/features/common/ShelledPage';
import { useDemoStore } from '@/store/demoStore';
import type { NotificationCategory } from '@/data/types';
import styles from './NotificationsPage.module.css';

const CATEGORY_TONE: Record<NotificationCategory, 'green' | 'gold' | 'amber' | 'red' | 'grey' | 'blue'> = {
  Assignment: 'blue', Review: 'green', Deadline: 'amber', Return: 'red',
  Approval: 'gold', 'Public Submission': 'blue', Publication: 'green', System: 'grey',
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const role = useDemoStore((s) => s.currentRole);
  const notifications = useDemoStore((s) => s.notifications);
  const markRead = useDemoStore((s) => s.markNotificationRead);
  const markAll = useDemoStore((s) => s.markAllNotificationsRead);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const mine = notifications
    .filter((n) => n.recipientId === role)
    .filter((n) => (unreadOnly ? !n.read : true));
  const unreadCount = notifications.filter((n) => n.recipientId === role && !n.read).length;

  function open(id: string, recordId?: string) {
    markRead(id);
    if (recordId) navigate(`/legislative/${recordId}`);
  }

  return (
    <ShelledPage
      breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Notifications' }]}
      title="Notifications"
      subtitle={`${unreadCount} unread across assignments, reviews, deadlines, approvals and publications.`}
      actions={
        <>
          <Button variant="secondary" onClick={() => setUnreadOnly((u) => !u)} aria-pressed={unreadOnly}>
            {unreadOnly ? 'Show all' : 'Unread only'}
          </Button>
          <Button variant="primary" leftIcon={<CheckCheck width={16} height={16} />} onClick={() => role && markAll(role)}>
            Mark all read
          </Button>
        </>
      }
    >
      <Panel padded={false}>
        {mine.length === 0 ? (
          <div className={styles.empty}>
            <Bell width={26} height={26} aria-hidden />
            <p className={styles.emptyTitle}>You’re all caught up</p>
            <p className={styles.emptyBody}>There are no {unreadOnly ? 'unread ' : ''}notifications to show.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {mine.map((n) => (
              <li key={n.id} className={`${styles.item} ${n.read ? '' : styles.unread}`}>
                <button className={styles.itemBtn} onClick={() => open(n.id, n.recordId)}>
                  {!n.read && <span className={styles.dot} aria-label="Unread" />}
                  <span className={styles.body}>
                    <span className={styles.itemTop}>
                      <StatusBadge tone={CATEGORY_TONE[n.category]} size="sm">{n.category}</StatusBadge>
                      <span className={styles.title}>{n.title}</span>
                    </span>
                    <span className={styles.text}>{n.body}</span>
                  </span>
                </button>
                {!n.read && (
                  <button className={styles.markBtn} onClick={() => markRead(n.id)} aria-label="Mark as read" title="Mark as read">
                    <Check width={16} height={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </ShelledPage>
  );
}
