export default function AdminPagination({ page, totalPages, onPageChange, totalItems, pageSize = 20 }) {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = totalItems ? (page - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : 0;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Number of page buttons to show
    let start = Math.max(1, page - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="admin-pagination">
      {totalItems > 0 && (
        <span className="admin-pg-info">
          Showing {startItem}–{endItem} of {totalItems}
        </span>
      )}

      <div className="admin-pg-controls">
        <button
          className="admin-pg-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Prev
        </button>

        <div className="admin-pg-pages">
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="admin-pg-ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`admin-pg-num ${p === page ? "active" : ""}`}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className="admin-pg-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}