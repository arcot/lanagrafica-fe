import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  createDateString,
  parseDay,
  parseMonth,
  parseYear,
  isAdult,
  isValidISODate,
  hasExpired,
  hasBeenSuspended,
  calculateProvince,
} from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "./status-badge";
import { useWindowSize } from "@/hooks/use-window-size";
import { UpdateMutation } from "@/hooks/use-table-mutations";
import { MemberExt } from "@/types/types";
import { PersonalTab } from "./personal-tab";
import { MembershipTab } from "./membership-tab";
import { NoteTab } from "./note-tab";

export function MemberDetails({
  row,
  updateMutation,
  children,
  variant = "personal",
}: {
  row: MemberExt;
  updateMutation: UpdateMutation;
  children: React.ReactNode;
  variant?: "personal" | "membership" | "note";
}) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(parseDay(row.birthDate));
  const [month, setMonth] = useState(parseMonth(row.birthDate));
  const [year, setYear] = useState(parseYear(row.birthDate));

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.required") }),
    surname: z.string().min(1, { message: t("validation.required") }),
    birth_date: z
      .string()
      .min(1, { message: t("validation.required") })
      .refine(isValidISODate, { message: t("validation.wrongDate") })
      .refine(isAdult, { message: t("validation.notAdult") }),
    birth_place: z.string().min(1, { message: t("validation.required") }),
    country: z.string().min(1, { message: t("validation.required") }),
    doc_type: z.string().min(1, { message: t("validation.required") }),
    doc_id: z.string().min(1, { message: t("validation.required") }),
    email: z.string(),
    measure: z.string().refine((measure) => measure || !isSuspended, {
      message: t("validation.required"),
    }),
    note: z.string(),
    suspended_till: z.string(),
    expiration_date: z.string(),
  });

  type FormData = z.infer<typeof formSchema>;

  const rowValues = useMemo(
    () => ({
      name: row.name || "",
      surname: row.surname || "",
      birth_date: createDateString(
        parseDay(row.birthDate),
        parseMonth(row.birthDate),
        parseYear(row.birthDate),
      ),
      birth_place: row.birthPlace || "",
      country: row.country || "",
      doc_type: row.docType || "",
      doc_id: row.docId || "",
      email: row.email || "",
      measure: row.measure || "",
      note: row.note || "",
      suspended_till: row.suspendedTill || "",
      expiration_date: row.expirationDate || "",
    }),
    [row],
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: rowValues,
  });
  const { isDirty } = form.formState;
  const isSuspended = hasBeenSuspended(
    new Date(form.watch("suspended_till") || ""),
  );
  const isExpired = hasExpired(new Date(form.watch("expiration_date") || ""));
  const isActive = !isSuspended && !isExpired;
  const isMobile = useWindowSize();

  // Re-initialize form when row changes
  useEffect(() => {
    form.reset(rowValues);
  }, [row, form, rowValues]);

  useEffect(() => {
    if (isDirty && !open) {
      form.reset(rowValues);
    }
  }, [open, form, rowValues, isDirty]);

  async function onSubmit(data: FormData) {
    // Backend requires ALL fields for updates (not just modified fields)
    // Calculate province to ensure it's in sync with country/city
    const province = calculateProvince(data.country, data.birth_place);

    // Build complete member update object with all fields
    const updateData = {
      name: data.name,
      surname: data.surname,
      province: province,
      birthDate: data.birth_date,
      birthPlace: data.birth_place,
      country: data.country,
      docType: data.doc_type,
      docId: data.doc_id,
      email: data.email || undefined, // Optional: send undefined if empty
      note: data.note || undefined, // Optional
      measure: data.measure || undefined, // Optional
      suspendedTill: data.suspended_till || undefined, // Optional
      expirationDate: data.expiration_date || undefined, // Optional
      isActive: isActive,
    };

    await updateMutation.mutate({
      id: row.id,
      details: updateData,
      name: row.name || "",
    });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {isMobile ? (
        <SheetTrigger asChild>{children}</SheetTrigger>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SheetTrigger asChild>{children}</SheetTrigger>
            </TooltipTrigger>
            <TooltipContent className={variant === "note" ? "max-w-96" : ""}>
              {variant === "personal" && t("membersTable.editMember")}
              {variant === "note" && row.note}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <SheetContent
        className="overflow-y-scroll w-full"
        onPointerDownOutside={(e) => {
          // Prevent clicks outside from propagating to table rows
          e.preventDefault();
        }}
      >
        <SheetHeader>
          <SheetTitle>
            <div className="flex gap-2">
              {`${row.name} ${row.surname}`}
              <StatusBadge status={row.status} />
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex justify-center">
          <Tabs defaultValue={variant} className="w-full space-y-6">
            <TabsList className="gap-1">
              <TabsTrigger value="personal">
                {t("memberDetails.personalTab")}
              </TabsTrigger>
              <TabsTrigger value="membership">
                {t("memberDetails.membershipTab")}
              </TabsTrigger>
              <TabsTrigger value="note">
                {t("memberDetails.noteTab")}
              </TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <PersonalTab
                  // @ts-expect-error - FormData type cannot be exported
                  form={form}
                  day={day}
                  month={month}
                  year={year}
                  setDay={setDay}
                  setMonth={setMonth}
                  setYear={setYear}
                  row={row}
                />
                <MembershipTab
                  // @ts-expect-error - FormData type cannot be exported
                  form={form}
                  row={row}
                  isExpired={isExpired}
                  isSuspended={isSuspended}
                />
                <NoteTab
                  // @ts-expect-error - FormData type cannot be exported
                  form={form}
                />
                <Button
                  disabled={!isDirty || form.formState.isSubmitting}
                  type="submit"
                  className="w-full mt-8"
                >
                  {t("memberDetails.save")}
                </Button>
              </form>
            </Form>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
