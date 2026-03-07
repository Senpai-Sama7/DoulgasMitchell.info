"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  Table as ReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { FileX, Inbox } from "lucide-react";

interface DataTableProps<TData> {
  table: ReactTable<TData>;
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
  };
}

export function DataTable<TData>({
  table,
  columns,
  data,
  emptyState,
}: DataTableProps<TData>) {
  const isEmpty = data.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-md bg-muted/50">
        {emptyState?.icon || <Inbox className="h-12 w-12 text-muted-foreground mb-4" />}
        <h3 className="text-lg font-medium text-foreground">
          {emptyState?.title || "No items found"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
          {emptyState?.description || "Get started by creating a new item."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "h-10 px-2 text-xs font-medium text-muted-foreground",
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getIsSorted() === "asc" && (
                      <span className="ml-1">↑</span>
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <span className="ml-1">↓</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "transition-colors",
                  row.getIsSelected() && "bg-muted"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileX className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    No results found
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Skeleton loader for the data table
export function DataTableSkeleton({ columnCount = 5, rowCount = 5 }: { columnCount?: number; rowCount?: number }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i} className="h-10 px-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell key={colIndex} className="p-2">
                  <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
