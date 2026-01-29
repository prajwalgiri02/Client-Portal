import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
  cell?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
  pageSize?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function Table<T>({
  data,
  columns,
  onSort,
  onEdit,
  onDelete,
  isLoading,
  pageSize = 10,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
}: TableProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors">
              {columns.map((column) => (
                <th
                  key={column.accessorKey as string}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                >
                  {column.sortable ? (
                    <button onClick={() => onSort?.(column.accessorKey)} className="flex items-center hover:text-foreground transition-colors">
                      {column.header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-muted/50 animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </td>
                  ))}
                  <td className="p-4">
                    <div className="h-8 bg-muted rounded w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="h-24 text-center align-middle text-muted-foreground">
                  No results found.
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.accessorKey as string} className="p-4 align-middle">
                      {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <IconButton variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />} onClick={() => onEdit(item)} tooltip="Edit" />
                        )}
                        {onDelete && (
                          <IconButton
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => onDelete(item)}
                            tooltip="Delete"
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </p>
          <div className="flex items-center space-x-2">
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronsLeft className="h-4 w-4" />}
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
            />
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            />
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronRight className="h-4 w-4" />}
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            />
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronsRight className="h-4 w-4" />}
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
