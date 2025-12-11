import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import InfiniteScroll from "react-infinite-scroll-component";
import { useCardsQuery } from "@/hooks/use-cards-query";
import { CardNumber } from "@/types/api.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading.json";

const columnHelper = createColumnHelper<CardNumber>();

const cardsPerPage = 20;

interface CardsTableProps {
  filter?: "available" | "all";
}

/**
 * Cards table with infinite scroll (optional, collapsible view)
 */
export function CardsTable({ filter = "available" }: CardsTableProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, fetchNextPage, hasNextPage, isPending, error } = useCardsQuery(
    filter,
    cardsPerPage
  );

  const columns = useMemo<ColumnDef<CardNumber, unknown>[]>(
    () => [
      columnHelper.accessor("cardNumber", {
        header: () => t("cards.cardNumber"),
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("insertDate", {
        header: () => t("cards.insertDate"),
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      }),
      columnHelper.accessor("dayOfUse", {
        header: () => t("cards.dayOfUse"),
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      }),
      columnHelper.accessor("isActive", {
        header: () => t("cards.status"),
        cell: (info) => {
          const isActive = info.getValue();
          return (
            <Badge variant={isActive ? "default" : "outline"}>
              {isActive ? t("cards.assigned") : t("cards.available")}
            </Badge>
          );
        },
      }),
    ],
    [t]
  );

  const rows = useMemo(() => {
    return (
      data?.pages.reduce((acc, page) => {
        return [...acc, ...page];
      }, []) ?? []
    );
  }, [data]);

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  });

  // Auto-fetch next page if needed
  useEffect(() => {
    const rowsCount = table.getRowModel().rows?.length;
    if (hasNextPage && rowsCount < cardsPerPage) fetchNextPage();
  }, [hasNextPage, table, fetchNextPage]);

  if (!isExpanded) {
    return (
      <div className="max-w-md mx-auto">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          <ChevronDown className="mr-2 h-4 w-4" />
          {t("cards.showAllCards")}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("cards.allCards")}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex justify-center items-center py-12">
            <Lottie
              animationData={loadingAnimation}
              style={{ width: 100, height: 100 }}
            />
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-8">
            {t("cards.loadError")}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("cards.noCards")}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={rows.length}
            next={fetchNextPage}
            hasMore={hasNextPage || false}
            loader={
              <div className="flex justify-center py-4">
                <Lottie
                  animationData={loadingAnimation}
                  style={{ width: 50, height: 50 }}
                />
              </div>
            }
            height={500}
            endMessage={
              <div className="text-center text-muted-foreground py-4 text-sm">
                {t("cards.endOfList")}
              </div>
            }
          >
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfiniteScroll>
        )}
      </CardContent>
    </Card>
  );
}
