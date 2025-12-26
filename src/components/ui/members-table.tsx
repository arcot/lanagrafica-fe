import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { SearchBar } from "./searchbar";
import { Separator } from "@radix-ui/react-separator";
import { useMembersMutations } from "@/hooks/use-table-mutations";
import { AddMember } from "./add-member";
import { useWindowSize } from "@/hooks/use-window-size";
import { useMembersQuery } from "@/hooks/use-members-query";
import { FilterPopover } from "./filter-popover";
import { HideFieldsPopover } from "./hide-fields-popover";
import { useMembersColumns } from "@/hooks/use-members-columns";
import loadingAnimation from "@/assets/loading.json";
import Lottie from "lottie-react";
import { Card, CardContent, CardHeader } from "./card";
import { useAuth } from "@/components/providers/auth-provider";

const membersPerPage = 20;

export function MembersTable() {
  const { t } = useTranslation();
  const { isStaff } = useAuth();
  const { insertMutation } = useMembersMutations();
  const isMobile = useWindowSize();
  const [debouncedSearch, setDebouncedSearch] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    isMobile
      ? {
          birth_date: false,
          email: false,
          province: false,
          suspended_till: false,
          expiration_date: false,
          card_number: false,
        }
      : {
          email: false,
          province: false,
          suspended_till: false,
          expiration_date: false,
        },
  );

  // Extract filter status from columnFilters
  const filterStatus = columnFilters.length > 0 && columnFilters[0].value
    ? (columnFilters[0].value as string)
    : "all";

  // Query data with filter status
  const { isPending, error, data, fetchNextPage, hasNextPage, refetch } =
    useMembersQuery(debouncedSearch, membersPerPage, filterStatus);

  useEffect(() => {
    if (debouncedSearch !== null) refetch();
  }, [refetch, debouncedSearch]);

  useEffect(() => {
    refetch();
  }, [refetch, filterStatus]);

  // Build table
  const columns = useMembersColumns();
  const rows = useMemo(() => {
    const allRows = data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, []) ?? [];

    // Only apply client-side filtering for "expired" status
    // Backend handles all other filters (all, active, inactive, suspended, deleted)
    if (filterStatus === "expired") {
      return allRows.filter(row => row.status === "expired");
    }

    return allRows;
  }, [data, filterStatus]);

  const table = useReactTable({
    state: {
      columnVisibility,
      columnFilters,
    },
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    // Removed getFilteredRowModel - filtering now happens via API or in rows useMemo
    onColumnFiltersChange: setColumnFilters,
  });

  useEffect(() => {
    const rowsCount = table.getRowModel().rows?.length;
    if (hasNextPage && rowsCount < membersPerPage) fetchNextPage();
  });

  return (
    <Card>
      <CardHeader>
        <div className="w-full">
          <div className="flex flex-row items-end justify-between gap-6 mt-6">
            <AddMember insertMutation={insertMutation} />
            <SearchBar setDebouncedSearch={setDebouncedSearch} />
          </div>
          <Separator className="h-0.5 bg-neutral-6 my-6" />
          <div className="flex justify-between">
            <div className="flex flex-wrap items-baseline">
              <FilterPopover
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
              />
            </div>
            <HideFieldsPopover
              table={table}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="w-full">
          {/* TODO make error more nice */}
          {error ? (
            <div className="flex items-center justify-center">
              <div>
                {t("errors.membersDidNotLoad")}: {error.name}: {error.message}
              </div>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={rows ? rows.length : 0}
              next={() => fetchNextPage()}
              hasMore={hasNextPage}
              loader={
                <Lottie
                  animationData={loadingAnimation}
                  loop={true}
                  autoplay={true}
                  className="h-8 my-2"
                />
              }
            >
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
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
                        data-row="true"
                        className="cursor-pointer"
                        onClick={(e) => {
                          // Prevent row click if clicking on buttons or interactive elements
                          const target = e.target as HTMLElement;
                          if (
                            target.closest('button') ||
                            target.closest('[role="button"]') ||
                            target.closest('a')
                          ) {
                            return;
                          }

                          // Find the edit button (SquarePen icon) and click it
                          const rowElement = e.currentTarget;
                          const editButton = rowElement.querySelector('[data-edit-trigger="true"]');
                          if (editButton instanceof HTMLElement) {
                            editButton.click();
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center"
                      >
                        {isStaff && (!debouncedSearch || debouncedSearch.trim().length === 0) ? (
                          <div className="py-8 text-muted-foreground">
                            {t("membersTable.searchToBegin")}
                          </div>
                        ) : isPending ? (
                          <Lottie
                            animationData={loadingAnimation}
                            loop={true}
                            autoplay={true}
                            className="h-8"
                          />
                        ) : (
                          t("membersTable.noResults")
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </InfiniteScroll>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
