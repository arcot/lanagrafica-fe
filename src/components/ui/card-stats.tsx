import { useCardStatsQuery } from "@/hooks/use-card-stats-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

/**
 * Card statistics component displaying available card count
 * Auto-refreshes every 30 seconds
 */
export function CardStats() {
  const { t } = useTranslation();
  const { data: stats, isLoading, isError } = useCardStatsQuery();

  if (isLoading) {
    return <StatCardSkeleton />;
  }

  if (isError || !stats) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t("cards.statsError")}
      </div>
    );
  }

  return (
    <StatCard
      title={t("cards.availableCards")}
      value={stats.available}
      icon={<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />}
    />
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}
