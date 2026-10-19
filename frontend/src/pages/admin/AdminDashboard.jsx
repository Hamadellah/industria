import { AlertTriangle, Banknote, ClipboardList, Clock, Package, Tags, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminHeader from '../../components/AdminHeader';
import EmptyState from '../../components/EmptyState';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import { useAdminShell } from '../../layouts/AdminLayout';
import { formatDate, formatMAD } from '../../lib/format';
import { useFetch } from '../../lib/hooks';
import { adminService } from '../../services';

const STATUS_COLORS = { en_attente: '#f59e0b', validee: '#10b981', rejetee: '#ef4444' };

export default function AdminDashboard() {
  const { openMenu } = useAdminShell();
  const { data, loading, error, reload } = useFetch(() => adminService.stats(), []);

  const t = data?.totals;
  const pie = t
    ? [
        { name: 'En attente', key: 'en_attente', value: t.en_attente },
        { name: 'Validées', key: 'validee', value: t.validee },
        { name: 'Rejetées', key: 'rejetee', value: t.rejetee },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <>
      <AdminHeader title="Tableau de bord" subtitle="Vue d'ensemble de la boutique" onMenu={openMenu} />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {error ? (
          <EmptyState icon={AlertTriangle} title="Statistiques indisponibles" description="Impossible de charger les données du tableau de bord." actionLabel="Réessayer" onAction={reload} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-[92px] rounded-2xl" />)
              ) : (
                <>
                  <StatsCard icon={Users} label="Utilisateurs" value={t.users} hint={`${t.clients} client(s)`} tone="sky" />
                  <StatsCard icon={Package} label="Produits" value={t.products} hint={`${t.low_stock} en stock faible`} tone="emerald" />
                  <StatsCard icon={Tags} label="Catégories" value={t.categories} tone="violet" />
                  <StatsCard icon={ClipboardList} label="Demandes" value={t.demandes} tone="amber" />
                  <StatsCard icon={Clock} label="En attente" value={t.en_attente} hint="À traiter" tone="amber" />
                  <StatsCard icon={ClipboardList} label="Validées" value={t.validee} tone="emerald" />
                  <StatsCard icon={ClipboardList} label="Rejetées" value={t.rejetee} tone="rose" />
                  <StatsCard icon={Banknote} label="Valeur validée" value={formatMAD(t.validated_revenue)} hint="Demandes validées" tone="emerald" />
                </>
              )}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <section className="card p-5 xl:col-span-2">
                <h2 className="font-bold">Demandes par mois</h2>
                <p className="mb-4 text-xs text-ink-soft">6 derniers mois</p>
                <div className="h-64">
                  {loading ? <div className="skeleton h-full rounded-xl" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.demandes_per_month} margin={{ left: -20, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => [v, 'Demandes']} />
                        <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>

              <section className="card p-5">
                <h2 className="font-bold">Répartition des statuts</h2>
                <div className="h-64">
                  {loading ? <div className="skeleton mt-4 h-56 rounded-xl" /> : pie.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-ink-soft">Aucune demande pour le moment.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {pie.map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <ul className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
                  {pie.map((s) => (
                    <li key={s.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.key] }} />{s.name} ({s.value})</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <section className="card overflow-hidden xl:col-span-2">
                <div className="flex items-center justify-between p-5 pb-3">
                  <h2 className="font-bold">Demandes récentes</h2>
                  <Link to="/admin/demandes" className="text-sm font-semibold text-accent-700 hover:underline">Gérer</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                      <tr><th className="px-5 py-2.5">Client</th><th className="px-3 py-2.5">Produit</th><th className="px-3 py-2.5">Date</th><th className="px-5 py-2.5">Statut</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? <tr><td colSpan={4} className="p-5"><div className="skeleton h-24 rounded-lg" /></td></tr> :
                        data.recent_demandes.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-soft">Aucune demande.</td></tr> :
                        data.recent_demandes.map((d) => (
                          <tr key={d.id}>
                            <td className="px-5 py-3 font-medium">{d.user?.name}</td>
                            <td className="max-w-[200px] truncate px-3 py-3">{d.quantity} × {d.product?.name}</td>
                            <td className="px-3 py-3 text-ink-soft">{formatDate(d.created_at)}</td>
                            <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Nouveaux utilisateurs</h2>
                  <Link to="/admin/users" className="text-sm font-semibold text-accent-700 hover:underline">Voir</Link>
                </div>
                <ul className="mt-3 divide-y divide-slate-100">
                  {(data?.recent_users || []).map((u) => (
                    <li key={u.id} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">{u.name.charAt(0).toUpperCase()}</span>
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{u.name}</p><p className="truncate text-xs text-ink-soft">{u.email}</p></div>
                      <span className="ml-auto text-xs text-ink-soft">{formatDate(u.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {!loading && data.products_per_category.length > 0 && (
              <section className="card p-5">
                <h2 className="mb-4 font-bold">Produits par catégorie</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.products_per_category} layout="vertical" margin={{ left: 40, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => [v, 'Produits']} />
                      <Bar dataKey="products_count" fill="#0b1b33" radius={[0, 6, 6, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
