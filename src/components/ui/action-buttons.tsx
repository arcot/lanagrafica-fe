import { MessageSquareText, RefreshCcw, SquarePen, FileText } from "lucide-react";
import { Button } from "./button";
import { MemberDetails } from "./member-details";
import { RenewConfirm } from "./renew-confirm";
import { useMembersMutations } from "@/hooks/use-table-mutations";
import { MemberExt } from "@/types/types";
import { openPDF, constructMemberPDFFilename } from "@/api/fileService";
import { useAuth } from "@/components/providers/auth-provider";
import { useState } from "react";
import { toast } from "sonner";

type ActionButtonsProps = {
  row: MemberExt;
};

export function ActionButtons({ row }: ActionButtonsProps) {
  const isRenewForbidden =
    row.status === "active" ||
    row.status === "suspended" ||
    row.status === "deleted";
  const hasNote = Boolean(row.note);

  const { renewMutation, updateMutation } = useMembersMutations();
  const { getAccessToken } = useAuth();
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);

  const handleViewPDF = async () => {
    setIsLoadingPDF(true);
    try {
      const token = await getAccessToken();

      // Construct the PDF filename matching backend format: [registrationDate]name_surname.pdf
      if (!row.registrationDate) {
        toast.error("Cannot fetch PDF: registration date is missing");
        setIsLoadingPDF(false);
        return;
      }

      const pdfFilename = constructMemberPDFFilename(
        row.name,
        row.surname,
        row.registrationDate
      );

      await openPDF(pdfFilename, false, token, false);
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to open PDF");
    } finally {
      setIsLoadingPDF(false);
    }
  };

  return (
    <div className="flex">
      <MemberDetails row={row} updateMutation={updateMutation}>
        <Button size="icon" variant="ghost">
          <SquarePen className="w-5" />
        </Button>
      </MemberDetails>

      <Button
        size="icon"
        variant="ghost"
        onClick={handleViewPDF}
        disabled={isLoadingPDF}
        title="View admission form PDF"
      >
        <FileText className="w-5" />
      </Button>

      <RenewConfirm
        isOpenForbidden={isRenewForbidden}
        id={row.id}
        name={`${row.name} ${row.surname}`}
        expirationDate={row.expirationDate || ""}
        renewMutation={renewMutation}
      >
        <Button size="icon" variant="ghost" disabled={isRenewForbidden}>
          <RefreshCcw className={`w-5`} />
        </Button>
      </RenewConfirm>

      <MemberDetails row={row} updateMutation={updateMutation} variant="note">
        <Button size="icon" variant="ghost" disabled={!hasNote}>
          <MessageSquareText className="w-5" />
        </Button>
      </MemberDetails>
    </div>
  );
}
