import { PageLayout } from "../layouts/page-layout";
import { CardStats } from "../ui/card-stats";
import { CardUpload } from "../ui/card-upload";
import { CardsTable } from "../ui/cards-table";
import { useTranslation } from "react-i18next";

/**
 * Card Number Management page
 * Features:
 * - Summary stats (total, available, assigned)
 * - File upload with auto-import
 * - Optional expandable table view
 */
export function Cards() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("cards.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("cards.description")}
          </p>
        </div>

        {/* Stats and upload section - centered with max width */}
        <div className="max-w-md mx-auto space-y-6">
          {/* Stats cards */}
          <CardStats />

          {/* Upload section */}
          <CardUpload />
        </div>

        {/* Optional table view (collapsed by default) */}
        <CardsTable filter="available" />
      </div>
    </PageLayout>
  );
}
