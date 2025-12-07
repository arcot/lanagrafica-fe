import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./button";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";
import { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { StatusBadge } from "./status-badge";

export function FilterPopover({
  columnFilters,
  setColumnFilters,
}: {
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  function handleFilterBadgeAddition(filter: string) {
    setOpen(false);
    let filterId: string;
    let filterValue: string;

    if (filter === "all") {
      setColumnFilters([]);
      return;
    }

    // All filters use the "status" column
    filterId = "status";
    filterValue = filter;

    setColumnFilters((prev: ColumnFiltersState) => {
      if (
        prev.find((item) => item.id === filterId && item.value === filterValue)
      ) {
        return prev;
      }

      return [
        {
          id: filterId,
          value: filterValue,
        },
      ];
    });
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="mb-6">
          <Filter className="w-4 mr-2" />
          {t("membersTable.addFilter")}
          {columnFilters.length ? (
            columnFilters.map((filter) => {
              const filterVariant = filter.value as string;
              return (
                <div className="ml-2" key={filterVariant}>
                  <StatusBadge status={filterVariant} />
                </div>
              );
            })
          ) : (
            <div className="ml-2" key="all">
              <StatusBadge status="all" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <ul className="space-y-2">
          <li>
            <Button
              size="sm"
              variant="active"
              onClick={() => handleFilterBadgeAddition("active")}
            >
              {t("membersTable.active")}
            </Button>
          </li>
          <li>
            <Button
              size="sm"
              variant="inactive"
              onClick={() => handleFilterBadgeAddition("inactive")}
            >
              {t("membersTable.inactive")}
            </Button>
          </li>
          <li>
            <ul className="ml-8 space-y-2 list-disc marker:text-accent-6">
              <li>
                <Button
                  size="xs"
                  variant="inactive"
                  onClick={() => handleFilterBadgeAddition("expired")}
                >
                  {t("membersTable.expired")}
                </Button>
              </li>
              <li>
                <Button
                  size="xs"
                  variant="suspended"
                  onClick={() => handleFilterBadgeAddition("suspended")}
                >
                  {t("membersTable.suspended")}
                </Button>
              </li>
              <li>
                <Button
                  size="xs"
                  variant="deleted"
                  onClick={() => handleFilterBadgeAddition("deleted")}
                >
                  {t("membersTable.deleted")}
                </Button>
              </li>
            </ul>
          </li>
          <li>
            <Button
              size="sm"
              variant="all"
              onClick={() => handleFilterBadgeAddition("all")}
            >
              {t("membersTable.all")}
            </Button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
