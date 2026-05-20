import { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

interface LogEntry {
  id:         string;
  event:      string;
  name:       string;
  email:      string;
  plan:       string;
  ip:         string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'just now';
}

export default function LogsPage() {
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/logs`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: LogEntry[]) => { setLogs(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filtered = logs.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const todayCount = logs.filter(l => {
    const d = new Date(l.created_at);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }).length;

  return (
    <PageLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
            Sign-up Logs
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Every free account created through the sign-up form.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total sign-ups', value: logs.length, color: 'var(--accent)' },
            { label: 'Today',          value: todayCount,  color: '#22C55E'       },
            { label: 'Free plan',      value: logs.filter(l => l.plan === 'free').length, color: 'var(--accent2)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>
                {loading ? '—' : value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 80px 90px 100px', gap: 0, padding: '10px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
            {['Name', 'Email', 'Plan', 'IP', 'Signed up'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {loading && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} className="animate-spin" />
              Loading logs…
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Could not load logs</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error} — is the backend running?</div>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                {search ? 'No results' : 'No sign-ups yet'}
              </div>
              <div style={{ fontSize: 13 }}>
                {search ? 'Try a different search term.' : 'Sign-ups will appear here as users register.'}
              </div>
            </div>
          )}

          {!loading && !error && filtered.map((log, i) => (
            <div
              key={log.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2.5fr 80px 90px 100px',
                gap: 0,
                padding: '12px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${log.email.charCodeAt(0) * 5 % 360},60%,75%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                }}>
                  {log.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.name}
                </span>
              </div>

              {/* Email */}
              <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.email}
              </div>

              {/* Plan */}
              <div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                  background: log.plan === 'free' ? 'rgba(124,92,252,0.1)' : 'rgba(252,92,173,0.1)',
                  color: log.plan === 'free' ? 'var(--accent)' : 'var(--accent2)',
                  textTransform: 'uppercase', letterSpacing: '0.4px',
                }}>
                  {log.plan}
                </span>
              </div>

              {/* IP */}
              <div style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.ip ?? '—'}
              </div>

              {/* Time */}
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }} title={log.created_at}>
                {timeAgo(log.created_at)}
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-faint)', textAlign: 'right' }}>
            Showing {filtered.length} of {logs.length} entries
          </div>
        )}
      </div>
    </PageLayout>
  );
}
