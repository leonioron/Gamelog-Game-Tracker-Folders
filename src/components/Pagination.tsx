import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    if (safePage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safePage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const handleChange = (page: number) => {
    if (page < 1 || page > totalPages || page === safePage) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 min-w-0"
    >
      <span className="text-xs font-mono tabular-nums text-slate-400">
        Exibindo <strong className="text-slate-200">{startItem}–{endItem}</strong> de{' '}
        <strong className="text-slate-200">{totalItems}</strong>
      </span>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => handleChange(safePage - 1)}
          disabled={safePage <= 1}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#090D14] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Página anterior"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="min-h-[44px] px-1.5 flex items-center justify-center text-xs font-mono text-slate-500 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => handleChange(item)}
              aria-current={item === safePage ? 'page' : undefined}
              className={`min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center rounded-xl text-xs font-mono tabular-nums font-semibold transition-colors cursor-pointer ${
                item === safePage
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#090D14] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => handleChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#090D14] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Próxima página"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
