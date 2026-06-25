import React, { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

/**
 * DataTable — reusable admin table
 *
 * props:
 *   columns:   [{ key, label, sortable, render?(row), className? }]
 *   data:      array of rows
 *   getRowId:  (row) => string
 *   pageSize:  default 8
 *   searchKeys: array of keys to search across
 *   rowActions: (row) => array of { label, onClick, danger? }
 *   bulkActions: [{ label, onClick(selectedIds[]) }]
 *   testid:    used to scope testids
 *   filters:   array of <FilterControl> (renderable JSX)
 *   toolbarRight: JSX to inject in toolbar (e.g. "+ Novo")
 *   emptyMessage
 */
export const DataTable = ({
  columns, data, getRowId, pageSize = 8, searchKeys = [], rowActions, bulkActions,
  testid = "table", filters, toolbarRight, emptyMessage = "Sem registos.",
}) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(null); // { key, dir }
  const [selected, setSelected] = useState(new Set());
  const [openRowMenu, setOpenRowMenu] = useState(null);

  useEffect(() => { setPage(1); setSelected(new Set()); }, [query, data]);

  const filtered = useMemo(() => {
    let list = data;
    if (query && searchKeys.length > 0) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (sort) {
      const { key, dir } = sort;
      list = [...list].sort((a, b) => {
        const av = a[key]; const bv = b[key];
        if (av == null) return 1; if (bv == null) return -1;
        if (typeof av === "number") return dir === "asc" ? av - bv : bv - av;
        return dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return list;
  }, [data, query, sort, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const allChecked = paged.length > 0 && paged.every((r) => selected.has(getRowId(r)));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) paged.forEach((r) => next.delete(getRowId(r)));
      else paged.forEach((r) => next.add(getRowId(r)));
      return next;
    });
  };
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white border hairline rounded-2xl overflow-hidden" data-testid={`${testid}-root`}>
      {/* toolbar */}
      <div className="p-4 border-b hairline flex flex-wrap items-center gap-3">
        {searchKeys.length > 0 && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--da-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid={`${testid}-search`}
              placeholder="Pesquisar..."
              className="pl-9 pr-3 py-2 rounded-lg border hairline font-body text-sm focus:outline-none focus:border-[var(--da-leaf)]"
            />
          </div>
        )}
        {filters}
        {selected.size > 0 && bulkActions && (
          <div className="flex items-center gap-2 ml-2" data-testid={`${testid}-bulk-bar`}>
            <span className="font-body text-xs text-[var(--da-muted)]">{selected.size} selecionado(s)</span>
            {bulkActions.map((a) => (
              <button
                key={a.label}
                onClick={() => { a.onClick([...selected]); setSelected(new Set()); }}
                data-testid={`${testid}-bulk-${a.label.toLowerCase().replace(/ /g, "-")}`}
                className="text-xs font-body px-3 py-1.5 rounded-full border hairline hover:bg-[var(--da-cream-2)]/60"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto">{toolbarRight}</div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead className="bg-[var(--da-cream-2)]/40 border-b hairline">
            <tr>
              {bulkActions && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} data-testid={`${testid}-select-all`} />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-left text-[10px] tracking-[0.18em] uppercase text-[var(--da-forest)] ${c.className || ""}`}
                >
                  {c.sortable ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      data-testid={`${testid}-sort-${c.key}`}
                      className="flex items-center gap-1 hover:text-[var(--da-leaf)]"
                    >
                      {c.label} <ArrowUpDown size={10} />
                    </button>
                  ) : c.label}
                </th>
              ))}
              {rowActions && <th className="w-10 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0) + (bulkActions ? 1 : 0)} className="text-center py-12 text-[var(--da-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : paged.map((row) => {
              const id = getRowId(row);
              return (
                <tr key={id} className="border-b hairline last:border-b-0 hover:bg-[var(--da-cream-2)]/30" data-testid={`${testid}-row-${id}`}>
                  {bulkActions && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(id)} onChange={() => toggleOne(id)} data-testid={`${testid}-select-${id}`} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ""}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setOpenRowMenu(openRowMenu === id ? null : id)}
                        data-testid={`${testid}-actions-${id}`}
                        className="w-8 h-8 rounded-full hover:bg-[var(--da-cream-2)]/60 flex items-center justify-center"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openRowMenu === id && (
                        <div className="absolute right-2 top-10 bg-white border hairline rounded-lg shadow-lg z-20 py-1 min-w-[160px]" data-testid={`${testid}-actions-menu-${id}`}>
                          {rowActions(row).map((a) => (
                            <button
                              key={a.label}
                              onClick={() => { a.onClick(row); setOpenRowMenu(null); }}
                              data-testid={`${testid}-action-${a.label.toLowerCase().replace(/ /g, "-")}-${id}`}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--da-cream-2)]/60 ${a.danger ? "text-red-700" : ""}`}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="p-4 border-t hairline flex items-center justify-between flex-wrap gap-3 text-xs font-body text-[var(--da-muted)]">
        <span data-testid={`${testid}-count`}>
          {filtered.length === 0 ? "0" : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)}`} de {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            data-testid={`${testid}-prev`}
            className="w-7 h-7 rounded-md border hairline flex items-center justify-center disabled:opacity-30"
          ><ChevronLeft size={12} /></button>
          <span className="px-2 text-[var(--da-forest)] font-semibold">{safePage}/{pageCount}</span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage === pageCount}
            data-testid={`${testid}-next`}
            className="w-7 h-7 rounded-md border hairline flex items-center justify-center disabled:opacity-30"
          ><ChevronRight size={12} /></button>
        </div>
      </div>
    </div>
  );
};

export const StatusBadge = ({ tone = "muted", children }) => {
  const map = {
    green: "bg-[#2E9E44]/15 text-[#14532D]",
    amber: "bg-[#B7BD53]/30 text-[#5b5e1a]",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-700",
    muted: "bg-[var(--da-cream-2)] text-[var(--da-muted)]",
  };
  return (
    <span className={`inline-block text-[10px] tracking-[0.16em] uppercase font-semibold px-2.5 py-1 rounded-full ${map[tone]}`}>
      {children}
    </span>
  );
};
