import React from 'react';

export function Table({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  emptyText = 'No clinical records found.',
  className = '',
  tableClassName = '',
  borderless = false,
  fixed = false
}) {
  const containerClass = borderless
    ? `w-full overflow-x-auto ${className}`
    : `w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs ${className}`;

  return (
    <div className={containerClass}>
      <table className={`w-full text-left text-sm text-slate-700 border-collapse ${fixed ? 'table-fixed' : ''} ${tableClassName}`}>
        <colgroup>
          {columns.map((col, idx) => (
            <col key={idx} style={col.width ? { width: col.width } : undefined} />
          ))}
        </colgroup>
        <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={col.width ? { width: col.width } : undefined}
                className={`px-5 py-3 text-left ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row[keyField] || rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-slate-50/80 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    style={col.width ? { width: col.width } : undefined}
                    className={`px-5 py-3 align-middle text-left ${col.cellClassName || ''}`}
                  >
                    {col.accessor ? col.accessor(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) {
  return (
    <div className={`overflow-x-auto whitespace-nowrap border-b border-slate-200 flex gap-4 sm:gap-6 text-sm font-medium -mx-1 px-1 scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-3 px-1 relative transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'text-[#1E56A0] font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-100 text-[#1E56A0]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E56A0] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
