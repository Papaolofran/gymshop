import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface Props{
  totalItems: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage?: number;
}

export const Pagination = ({totalItems, page, setPage, itemsPerPage = 10}: Props) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ocultar si sólo hay 1 página
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8 bg-white py-3 px-6 rounded-full shadow-sm w-fit mx-auto border border-gray-100">
      <button
        onClick={() => setPage(p => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <LuChevronLeft size={20} />
      </button>
      <span className="text-sm font-medium text-gray-600">
        Página <span className="text-black font-bold">{page}</span> de {totalPages}
      </span>
      <button
        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <LuChevronRight size={20} />
      </button>
    </div>
  );
};