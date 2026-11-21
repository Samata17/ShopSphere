import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function getPageNumbers(current, total) {
  const pages = [];
  const windowSize = 1;

  for (let i = 1; i <= total; i += 1) {
    const isEdge = i === 1 || i === total;
    const isNearCurrent = Math.abs(i - current) <= windowSize;

    if (isEdge || isNearCurrent) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav className="pagination" aria-label="Product pages">
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <FaChevronLeft />
        Previous
      </button>

      <div className="pagination-numbers">
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
              …
            </span>
          ) : (
            <button
              type="button"
              key={pageNumber}
              className={`pagination-number ${pageNumber === page ? "active" : ""}`}
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next
        <FaChevronRight />
      </button>
    </nav>
  );
}

export default Pagination;
