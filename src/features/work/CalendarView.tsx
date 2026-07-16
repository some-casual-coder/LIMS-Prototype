import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, FileClock, CalendarCheck, Gavel, Bell } from 'lucide-react';
import { toneVars } from '@/components/ui/tone';
import { calendarWeek, calendarEvents, type CalendarEvent } from '@/data/myWork';
import styles from './CalendarView.module.css';

const MODES = ['Month', 'Week', 'Agenda'];
const HOUR_START = 8;
const HOUR_END = 18;
const HOUR_H = 52;

const TYPE_ICON = {
  'draft-due': FileClock, 'review-deadline': CalendarCheck, 'publication-deadline': CalendarCheck,
  sitting: Gavel, 'participation-close': CalendarCheck, 'signature-due': CalendarCheck, reminder: Bell,
} as const;

const TYPE_LABEL: Record<CalendarEvent['type'], string> = {
  'draft-due': 'Draft due', 'review-deadline': 'Review', 'publication-deadline': 'Publication',
  sitting: 'Sitting', 'participation-close': 'Participation closes', 'signature-due': 'Signature due', reminder: 'Reminder',
};

export function CalendarView({ onOpenItem }: { onOpenItem: (id: string) => void }) {
  const [mode, setMode] = useState('Week');
  // Live clock: drives the "now" indicator line + the toolbar time; ticks each minute.
  const [now, setNow] = useState(() => new Date());
  const [scrollSignal, setScrollSignal] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const liveTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.modes} role="tablist" aria-label="Calendar mode">
          {MODES.map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} className={`${styles.modeBtn} ${mode === m ? styles.modeActive : ''}`} onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
        <div className={styles.nav}>
          <span className={styles.liveNow} aria-live="polite"><span className={styles.liveDot} /> Now · {liveTime}</span>
          <button className={styles.today} onClick={() => { setMode('Week'); setScrollSignal((s) => s + 1); }}>Today</button>
          <button className={styles.navArrow} aria-label="Previous week" disabled title="This week is the only seeded period"><ChevronLeft width={16} height={16} /></button>
          <span className={styles.range}>{calendarWeek.label}</span>
          <button className={styles.navArrow} aria-label="Next week" disabled title="This week is the only seeded period"><ChevronRight width={16} height={16} /></button>
        </div>
      </div>

      {mode === 'Week' && <WeekGrid onOpenItem={onOpenItem} now={now} scrollSignal={scrollSignal} />}
      {mode === 'Agenda' && <Agenda onOpenItem={onOpenItem} />}
      {mode === 'Month' && <MonthGrid onOpenItem={onOpenItem} />}
    </div>
  );
}

function WeekGrid({ onOpenItem, now, scrollSignal }: { onOpenItem: (id: string) => void; now: Date; scrollSignal: number }) {
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const showNow = nowHour >= HOUR_START && nowHour < HOUR_END;
  const nowTop = (nowHour - HOUR_START) * HOUR_H;
  const nowRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollSignal) nowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [scrollSignal]);
  return (
    <div className={styles.weekWrap}>
      <div className={styles.weekHead}>
        <div className={styles.gutterHead} />
        {calendarWeek.days.map((d, i) => (
          <div key={d.date} className={styles.dayHead}>
            <span className={styles.dayLabel}>{d.label}</span>
            <span className={`${styles.dayDate} ${i === calendarWeek.todayIndex ? styles.dayDateToday : ''}`}>{d.date}</span>
          </div>
        ))}
      </div>
      <div className={styles.allDay}>
        <span className={styles.allDayLabel}>All day</span>
        {calendarWeek.days.map((d) => <div key={d.date} className={styles.allDayCell} />)}
      </div>
      <div className={styles.weekBody}>
        <div className={styles.gutter}>
          {hours.map((h) => (
            <div key={h} className={styles.hourRow} style={{ height: HOUR_H }}>
              <span className={styles.hourLabel}>{h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}</span>
            </div>
          ))}
        </div>
        {calendarWeek.days.map((d, dayIdx) => (
          <div key={d.date} className={`${styles.dayCol} ${dayIdx === calendarWeek.todayIndex ? styles.dayColToday : ''}`} style={{ height: (HOUR_END - HOUR_START) * HOUR_H }}>
            {hours.map((h) => <div key={h} className={styles.gridLine} style={{ top: (h - HOUR_START) * HOUR_H }} />)}
            {dayIdx === calendarWeek.todayIndex && showNow && <div ref={nowRef} className={styles.nowLine} style={{ top: nowTop }}><span className={styles.nowDot} /></div>}
            {calendarEvents.filter((e) => e.day === dayIdx).map((e, ei) => {
              const tv = toneVars[e.tone];
              const Icon = TYPE_ICON[e.type];
              return (
                <button
                  key={e.id}
                  className={`${styles.event} item-in`}
                  style={{ top: (e.start - HOUR_START) * HOUR_H + 2, height: (e.end - e.start) * HOUR_H - 3, background: tv.bg, color: tv.fg, '--item-delay': `${(dayIdx * 2 + ei) * 0.05}s` } as CSSProperties}
                  onClick={() => e.recordId && onOpenItem(e.recordId)}
                  disabled={!e.recordId}
                >
                  <span className={styles.eventTime}>{fmt(e.start)}</span>
                  <span className={styles.eventTitle}><Icon width={11} height={11} /> {e.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Agenda({ onOpenItem }: { onOpenItem: (id: string) => void }) {
  const byDay = calendarWeek.days.map((d, i) => ({ day: d, events: calendarEvents.filter((e) => e.day === i) })).filter((g) => g.events.length);
  return (
    <div className={styles.agenda}>
      {byDay.map(({ day, events }) => (
        <div key={day.date} className={styles.agendaDay}>
          <div className={styles.agendaDate}><span className={styles.agendaWeekday}>{day.label}</span><span className={styles.agendaNum}>{day.date} July</span></div>
          <ul className={styles.agendaList}>
            {events.map((e, ei) => {
              const tv = toneVars[e.tone];
              const Icon = TYPE_ICON[e.type];
              return (
                <li key={e.id} className="item-in" style={{ '--item-delay': `${ei * 0.05}s` } as CSSProperties}>
                  <button className={styles.agendaItem} onClick={() => e.recordId && onOpenItem(e.recordId)} disabled={!e.recordId}>
                    <span className={styles.agendaBar} style={{ background: tv.dot }} />
                    <span className={styles.agendaIcon} style={{ color: tv.fg }}><Icon width={15} height={15} /></span>
                    <span className={styles.agendaText}>
                      <span className={styles.agendaTitle}>{e.title}</span>
                      <span className={styles.agendaMeta}>{TYPE_LABEL[e.type]} · {fmt(e.start)}–{fmt(e.end)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MonthGrid({ onOpenItem }: { onOpenItem: (id: string) => void }) {
  // July 2026 grid; events fall on 13–19 (this week's dates).
  const firstDow = new Date(2026, 6, 1).getDay(); // 0=Sun
  const cells: (number | null)[] = [];
  const lead = (firstDow + 6) % 7; // convert to Monday-first
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) cells.push(d);
  const eventsByDate: Record<number, CalendarEvent[]> = {};
  calendarEvents.forEach((e) => {
    const date = calendarWeek.days[e.day].date;
    (eventsByDate[date] ??= []).push(e);
  });
  const todayDate = calendarWeek.days[calendarWeek.todayIndex].date;
  return (
    <div className={styles.month}>
      <div className={styles.monthHead}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className={styles.monthGrid}>
        {cells.map((d, i) => (
          <div key={i} className={`${styles.monthCell} ${d === todayDate ? styles.monthToday : ''}`}>
            {d && <span className={styles.monthNum}>{d}</span>}
            {d && (eventsByDate[d] ?? []).map((e, ei) => (
              <button key={e.id} className={`${styles.monthEvent} item-in`} style={{ background: toneVars[e.tone].bg, color: toneVars[e.tone].fg, '--item-delay': `${ei * 0.05}s` } as CSSProperties} onClick={() => e.recordId && onOpenItem(e.recordId)} disabled={!e.recordId}>
                {e.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const fmt = (h: number) => {
  const hr = Math.floor(h);
  const m = h % 1 ? '30' : '00';
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
