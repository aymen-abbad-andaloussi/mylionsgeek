import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import LineStatistic from './partials/components/LineChart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export default function AdminUserProfile() {
  const { props } = usePage();
  const getInitials = useInitials();
  const user = props.user;
  const projects = props.projects || [];
  const posts = props.posts || [];
  const certificates = props.certificates || [];
  const cv = props.cv || null;
  const notes = props.notes || [];
  const discipline = props.discipline ?? null;
  const absences = props.absences || { data: [], meta: {} };
  const recentAbsences = props.recentAbsences || [];
  function timeAgo(timestamp) {
    if (!timestamp) return 'Never';

    const now = new Date();
    const last = new Date(timestamp + 'Z');

    const diff = Math.floor((now - last) / 1000); // seconds

    if (diff < 60) return 'Online now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
    if (diff < 172800) return 'Yesterday';
    return last.toLocaleDateString();
  }

  const coverUrl = useMemo(() => user?.cover || '/assets/images/cover-placeholder.svg', [user]);

  return (
    <AppLayout breadcrumbs={[{ title: 'Users', href: '/admin/users' }, { title: user?.name || 'Profile', href: `/admin/users/${user?.id}` }]}>
      <Head title={`Profile – ${user?.name || ''}`} />

      <div className="p-0">
        {/* Cover */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-t-lg">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
        </div>

        {/* Header */}
        <div className="px-6 -mt-10 flex items-end gap-4 justify-between">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-neutral-900 bg-neutral-200 flex items-center justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-alpha/20">
                {user?.image ? (
                  <AvatarImage
                    src={`/storage/img/profile/${user.image}`}
                    alt={user?.name}
                  />
                ) : (
                  <AvatarFallback className="rounded-full bg-alpha text-white text-2xl font-bold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-light dark:border-dark ${timeAgo(user.last_online) === 'Online now'
                ? ' bg-green-500'
                : 'bg-neutral-500'
                }`}></div>
            </div>
          </div>
          <div className="pb-2 flex-1">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">{user?.email}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-alpha/10 text-alpha">{user?.role || 'Member'}</span>
              {user?.promo && <span className="text-xs px-2 py-1 rounded-full bg-alpha/10 text-alpha">Promo {user.promo}</span>}
              {user?.status && <span className="text-xs px-2 py-1 rounded-full bg-alpha/10 text-alpha">{user.status}</span>}
            </div>
          </div>
          <div className="pb-2 flex items-center gap-2">
            <a href={`mailto:${user?.email}`} className="px-3 py-2 rounded-lg border border-alpha/30 text-sm hover:bg-alpha/10 transition">Email</a>
            <a href={`tel:${user?.phone || ''}`} className="px-3 py-2 rounded-lg border border-alpha/30 text-sm hover:bg-alpha/10 transition">Call</a>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Info cards */}
          <div className="space-y-6">
            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">About</h2>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-neutral-500">Role:</span> {user?.role || '—'}</div>
                <div><span className="text-neutral-500">Status:</span> {user?.status || '—'}</div>
                <div><span className="text-neutral-500">Phone:</span> {user?.phone || '—'}</div>
                <div><span className="text-neutral-500">CIN:</span> {user?.cin || '—'}</div>
                <div><span className="text-neutral-500">Promo:</span> {user?.promo || '—'}</div>
                <div><span className="text-neutral-500">Last Online:</span> {user?.last_online ? new Date(user.last_online).toLocaleString() : '—'}</div>

              </div>
            </div>

            {/* Quick Stats (placeholders; wire real data later) */}
            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Quick Stats</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-alpha/20 p-3">
                  <div className="text-xl font-bold">—</div>
                  <div className="text-xs text-neutral-500">Attendance %</div>
                </div>
                <div className="rounded-lg border border-alpha/20 p-3">
                  <div className="text-xl font-bold">—</div>
                  <div className="text-xs text-neutral-500">Projects</div>
                </div>
                <div className="rounded-lg border border-alpha/20 p-3">
                  <div className="text-xl font-bold">—</div>
                  <div className="text-xs text-neutral-500">Posts</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Access</h2>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-neutral-500">Studio:</span> {(user?.access?.access_studio ?? user?.access_studio) ? 'Yes' : 'No'}</div>
                <div><span className="text-neutral-500">Cowork:</span> {(user?.access?.access_cowork ?? user?.access_cowork) ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">CV</h2>
              {cv ? (
                <a href={cv.url} target="_blank" rel="noreferrer" className="text-alpha underline">View CV</a>
              ) : (
                <div className="text-sm text-neutral-500">No CV uploaded</div>
              )}
            </div>

            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Medical Certificate</h2>
              {certificates && certificates.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {certificates.map((c, i) => (
                    <li key={i}><a href={c.url} target="_blank" rel="noreferrer" className="text-alpha underline">{c.name || `Certificate ${i + 1}`}</a></li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-neutral-500">No medical certificate</div>
              )}
            </div>

            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Notes</h2>
              {notes && notes.length > 0 ? (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {notes.map((n, i) => (<li key={i}>{n.text}</li>))}
                </ul>
              ) : (
                <div className="text-sm text-neutral-500">No notes yet</div>
              )}
            </div>

            {/* Skills & Badges (placeholders) */}
            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Skills & Badges</h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-alpha/10 text-alpha">Teamwork</span>
                <span className="px-2 py-1 rounded-full bg-alpha/10 text-alpha">Problem Solving</span>
                <span className="px-2 py-1 rounded-full bg-alpha/10 text-alpha">React</span>
                <span className="px-2 py-1 rounded-full bg-alpha/10 text-alpha">Laravel</span>
              </div>
            </div>
          </div>

          {/* Right: Tabs-like sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Overview */}
            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Attendance Overview</h2>
              {discipline === null ? (
                <div className="text-sm text-neutral-500">No attendance data available yet.</div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">Discipline</div>
                    <div className="text-3xl font-extrabold text-alpha">{discipline}%</div>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-alpha" style={{ width: `${Math.max(0, Math.min(100, discipline))}%` }} />
                  </div>
                </div>
              )}
              {/* Recent 5 absences */}
              <div className="mt-5">
                <div className="text-sm font-semibold mb-2">Recent Absences</div>
                {Array.isArray(recentAbsences) && recentAbsences.length > 0 ? (
                  <div className="space-y-2">
                    {recentAbsences.map((row, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-alpha/20 px-3 py-2">
                        <div className="text-sm font-medium">{new Date(row.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${row.morning === 'absent' ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-neutral-800'}`}>AM: {row.morning}</span>
                          <span className={`px-2 py-0.5 rounded-full ${row.lunch === 'absent' ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-neutral-800'}`}>Noon: {row.lunch}</span>
                          <span className={`px-2 py-0.5 rounded-full ${row.evening === 'absent' ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-neutral-800'}`}>PM: {row.evening}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">No absences yet.</div>
                )}
              </div>
            </div>

            {/* Attendance Line Chart */}
            <div className="rounded-xl border border-alpha/20 p-4">
              <LineStatistic user={user} />
            </div>

            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Projects</h2>
              {projects.length === 0 ? (
                <div className="text-sm text-neutral-500">No projects</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <div key={p.id} className="rounded-lg border border-alpha/20 p-3 hover:bg-alpha/5 transition">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-neutral-500">{p.description}</div>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-alpha underline">Open</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Posts</h2>
              {posts.length === 0 ? (
                <div className="text-sm text-neutral-500">No posts</div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="rounded-lg border border-alpha/20 p-3 hover:bg-alpha/5 transition">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm">{post.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Absences (paginated, only absent) */}
            <div className="rounded-xl border border-alpha/20 p-4">
              <h2 className="font-semibold mb-3">Absences</h2>
              {absences.data && absences.data.length > 0 ? (
                <div className="space-y-2">
                  {absences.data.map((row, i) => (
                    <div key={i} className="rounded-lg border border-alpha/20 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{new Date(row.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${row.morning === 'absent' ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-neutral-800'}`}>AM: {row.morning}</span>
                          <span className={`px-2 py-0.5 rounded-full ${row.lunch === 'absent' ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-neutral-800'}`}>Noon: {row.lunch}</span>
                          <span className={`px-2 py-0.5 rounded-full ${row.evening === 'absent' ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-neutral-800'}`}>PM: {row.evening}</span>
                        </div>
                      </div>
                      {Array.isArray(row.notes) && row.notes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {row.notes.map((n, idx) => (
                            <span key={idx} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs">{n}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Pagination */}
                  {absences.meta && absences.meta.last_page > 1 && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <a
                        className="text-sm px-3 py-1 rounded border border-alpha/20 hover:bg-alpha/10"
                        href={`?page=${Math.max(1, (absences.meta.current_page || 1) - 1)}`}
                      >Prev</a>
                      <span className="text-xs text-neutral-500">Page {absences.meta.current_page} / {absences.meta.last_page}</span>
                      <a
                        className="text-sm px-3 py-1 rounded border border-alpha/20 hover:bg-alpha/10"
                        href={`?page=${Math.min(absences.meta.last_page || 1, (absences.meta.current_page || 1) + 1)}`}
                      >Next</a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">No absences to display.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

