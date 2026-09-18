import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { templates, type Template, type TemplateCategory } from '../features/templates/templateCatalog';
import { listAvailableTemplates } from '../api/templates';
import { useQuery } from '@tanstack/react-query';

const categories: { name: TemplateCategory; hint: string }[] = [
  { name: 'All', hint: 'Every homepage layout' },
  { name: 'Modern', hint: 'Clear and current' },
  { name: 'Classic', hint: 'Warm and established' },
  { name: 'Bold', hint: 'High-energy layouts' },
  { name: 'Minimal', hint: 'Quiet confidence' },
];

function TemplateThumbnail({ template }: { template: Template }) {
  const layoutPreview = {
    editorial: <><div className="grid grid-cols-[1.25fr_.75fr] gap-2.5"><div className="rounded-md px-2.5 py-2.5" style={{ background: template.dark }}><div className="h-1.5 w-10 rounded-full bg-white/50"/><div className="mt-2 h-2.5 w-20 rounded-full bg-white"/><div className="mt-1 h-1.5 w-16 rounded-full bg-white/60"/><div className="mt-3 h-4 w-11 rounded-sm" style={{ background: template.accent }}/></div><div className="rounded-md" style={{ background: `linear-gradient(145deg, ${template.accent}, ${template.accentSoft})` }}><div className="m-2 ml-auto h-7 w-7 rounded-full border-4 border-white/70"/></div></div><div className="mt-2.5 grid grid-cols-3 gap-2">{[0, 1, 2].map((item) => <div key={item} className="h-10 rounded-md" style={{ background: item === 1 ? template.accentSoft : '#f1f5f9' }}/>)}</div></>,
    classic: <><div className="border-b-2 pb-2 text-center" style={{ borderColor: template.accent }}><div className="mx-auto h-5 w-5 rounded-full border-2" style={{ borderColor: template.accent }}/><div className="mx-auto mt-2 h-2 w-24 rounded-full" style={{ background: template.dark }}/></div><div className="mt-3 grid grid-cols-[.7fr_1.3fr] gap-2"><div className="h-20 rounded-sm" style={{ background: template.accentSoft }}/><div><div className="h-2 w-20 rounded bg-slate-200"/><div className="mt-2 h-1.5 w-full rounded bg-slate-100"/><div className="mt-1 h-1.5 w-4/5 rounded bg-slate-100"/><div className="mt-4 h-4 w-14 rounded-sm" style={{ background: template.accent }}/></div></div></>,
    playful: <><div className="relative h-20 overflow-hidden rounded-lg" style={{ background: template.accent }}><div className="absolute -left-2 -top-3 h-12 w-12 rounded-full bg-white/35"/><div className="absolute right-3 top-2 h-7 w-7 rotate-12 rounded-sm bg-amber-200"/><div className="absolute bottom-3 left-3 h-2.5 w-24 rounded-full bg-white"/><div className="absolute bottom-7 left-3 h-1.5 w-16 rounded-full bg-white/70"/></div><div className="mt-3 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-10 rounded-lg" style={{ background: [template.accentSoft, '#fde68a', '#bfdbfe', '#bbf7d0'][item] }}/>)}</div></>,
    minimal: <><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="h-2 w-12 bg-slate-900"/><div className="h-1.5 w-20 rounded bg-slate-200"/></div><div className="mt-5"><div className="h-2.5 w-32 bg-slate-900"/><div className="mt-2 h-2.5 w-24 bg-slate-900"/><div className="mt-4 h-1.5 w-full rounded bg-slate-100"/><div className="mt-1 h-1.5 w-3/4 rounded bg-slate-100"/></div><div className="mt-5 flex gap-2"><div className="h-8 flex-1" style={{ background: template.dark }}/><div className="h-8 flex-1 bg-slate-100"/></div></>,
    heritage: <><div className="border-y-2 py-3 text-center" style={{ borderColor: template.accent }}><div className="mx-auto h-5 w-5 rotate-45 border-2" style={{ borderColor: template.accent }}/><div className="mx-auto mt-3 h-2 w-24 rounded" style={{ background: template.dark }}/></div><div className="mt-3 rounded-md p-3" style={{ background: template.accentSoft }}><div className="h-2 w-28 rounded bg-white"/><div className="mt-2 h-1.5 w-4/5 rounded bg-white/70"/><div className="mt-3 h-4 w-14 rounded" style={{ background: template.accent }}/></div></>,
    stem: <><div className="grid grid-cols-4 gap-1.5">{[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <div key={item} className="h-8 rounded-sm" style={{ background: item === 0 || item === 5 ? template.accent : item === 3 ? template.dark : '#e2e8f0' }}/>)}</div><div className="mt-3 grid grid-cols-[1.4fr_.6fr] gap-2"><div className="rounded p-3" style={{ background: template.dark }}><div className="h-2 w-20 rounded bg-white"/><div className="mt-2 h-1.5 w-full rounded bg-white/50"/></div><div className="rounded" style={{ background: template.accentSoft }}/></div></>,
  }[template.layout];
  return (
    <div className="relative h-48 overflow-hidden rounded-t-2xl bg-slate-100 p-3" style={{ background: template.accentSoft }}>
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="flex h-7 items-center justify-between px-3" style={{ background: template.dark }}>
          <span className="h-1.5 w-12 rounded-full bg-white/80" />
          <span className="h-1.5 w-8 rounded-full bg-white/30" />
        </div>
        <div className="p-3">{layoutPreview}</div>
      </div>
      {template.badge && <span className="absolute left-5 top-5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">{template.badge}</span>}
    </div>
  );
}

export default function TemplatesPage() {
  const availableTemplatesQuery = useQuery({ queryKey: ['available-templates'], queryFn: listAvailableTemplates });
  const [category, setCategory] = useState<TemplateCategory>('All');
  const [query, setQuery] = useState('');
  const shownTemplates = useMemo(() => templates.filter((template) => {
    const isAllowed = (availableTemplatesQuery.data ?? []).includes(template.id);
    const matchesCategory = category === 'All' || template.category === category;
    const matchesQuery = template.name.toLowerCase().includes(query.toLowerCase()) || template.description.toLowerCase().includes(query.toLowerCase());
    return isAllowed && matchesCategory && matchesQuery;
  }), [availableTemplatesQuery.data, category, query]);

  return (
    <div className="min-h-full bg-[#f6f8fc] p-6 lg:p-9">
      <div className="w-full max-w-none">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Website studio</p>
            <h1 className="text-3xl font-semibold tracking-tight text-secondary">Complete school website templates</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Each template is a complete multi-page school website: Home, About, Academics, Admissions, Campus Life, News and Contact. Preview the whole design, then customise it in the template workspace.</p>
          </div>
          <label className="relative block w-full lg:w-72">
            <span className="sr-only">Search templates</span>
            <svg className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-secondary shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>

        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Website styles</p>
            <div className="space-y-1">
              {categories.map((item) => (
                <button key={item.name} onClick={() => setCategory(item.name)} className={`w-full rounded-xl px-3 py-2.5 text-left transition ${category === item.name ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-slate-50'}`}>
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className={`block pt-0.5 text-xs ${category === item.name ? 'text-white/75' : 'text-gray-400'}`}>{item.hint}</span>
                </button>
              ))}
            </div>
            <div className="mx-3 mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs leading-5 text-gray-500"><span className="font-semibold text-secondary">For this school only.</span> Create the homepage look here; current Pages and global Theme are untouched.</p>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium text-gray-500">{shownTemplates.length} complete website template{shownTemplates.length === 1 ? '' : 's'} available</p><p className="text-xs text-gray-400">Preview the full website first</p></div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {shownTemplates.map((template) => (
                <article key={template.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
                  <TemplateThumbnail template={template} />
                  <div className="flex items-center justify-end gap-2 border-t border-gray-100 p-4">
                    <Link to={`/website/templates/${template.id}/preview`} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-slate-50 hover:text-primary">Preview</Link>
                    <Link to={`/website/templates/${template.id}/edit`} aria-label="Edit template" className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Edit</Link>
                  </div>
                </article>
              ))}
            </div>
            {availableTemplatesQuery.isLoading && <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-sm text-gray-500">Loading templates granted to your plan…</div>}
            {!availableTemplatesQuery.isLoading && shownTemplates.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-sm text-gray-500">No templates have been granted to this school’s plan yet. Ask your Super Admin to assign a plan and enable templates.</div>}
          </section>
        </div>
      </div>
    </div>
  );
}
