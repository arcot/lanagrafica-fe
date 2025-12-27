import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import countries from "@/assets/countries.json";
import cities from "@/assets/cities.json";
import documents from "@/assets/documents.json";
import {
  calculateProvince,
  isAdult,
  isValidISODate,
} from "@/lib/utils";
import { useState } from "react";
import { InputField } from "@/components/ui/input-field";
import { Combobox } from "@/components/ui/combobox";
import { SelectField } from "@/components/ui/select-field";
import { DateField } from "@/components/ui/date-field";
import { Plus } from "lucide-react";
import { InsertMutation } from "@/hooks/use-table-mutations";
import { MemberInsert } from "@/types/types";
import { ConsentForm } from "@/components/ui/consent-form";
import { SignaturePad } from "@/components/ui/signature-pad";

export function AddMember({
  insertMutation,
}: {
  insertMutation: InsertMutation;
}) {
  const { t, i18n } = useTranslation();
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [open, setOpen] = useState(false);

  // Terms and signature workflow state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

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
    email: z.string().email({ message: t("validation.required") }).optional().or(z.literal("")),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      surname: "",
      birth_date: "",
      birth_place: "",
      country: "Italy",
      doc_type: "",
      doc_id: "",
      email: "",
    },
  });

  const country = form.watch("country");
  const isItaly = country === "Italy" || country === "Italia";

  function toInsert(data: FormData): MemberInsert {
    // Calculate province based on country and city selection
    const province = calculateProvince(data.country, data.birth_place);

    const insertData: MemberInsert = {
      name: data.name,
      surname: data.surname,
      birthDate: data.birth_date,
      birthPlace: data.birth_place,
      country: data.country,
      docType: data.doc_type,
      docId: data.doc_id,
      email: data.email || undefined,
      province: province,
      // Note: cardNumber is auto-assigned by backend
      // Note: note and measure are NOT included in add form (only edit form)
    };

    return insertData;
  }

  function handleFormSubmit() {
    // Instead of submitting immediately, show terms modal first
    setShowTermsModal(true);
  }

  function handleTermsAccepted() {
    // Close terms modal and show signature pad
    setShowTermsModal(false);
    setShowSignaturePad(true);
  }

  function handleSignatureSaved(signature: string) {
    // Save signature (strip the data:image/png;base64, prefix like legacy app does)
    const base64Signature = signature.replace(/^data:image\/png;base64,/, '');
    setSignatureData(base64Signature);
    setShowSignaturePad(false);
    // Now actually submit the form with the signature
    submitMember(base64Signature);
  }

  function handleSignatureCleared() {
    setSignatureData(null);
  }

  async function submitMember(signature: string) {
    const data = form.getValues();
    const memberSerialized = toInsert(data);

    // Add signature to the payload (matches legacy behavior)
    const memberWithSignature = {
      ...memberSerialized,
      signature: signature,
    };

    await insertMutation.mutate({
      details: memberWithSignature,
      name: memberWithSignature.name || "",
    });

    resetForm();
    setOpen(false);
  }

  function resetForm() {
    setDay("");
    setMonth("");
    setYear("");
    setCountrySearch("");
    setCitySearch("");
    setSignatureData(null);
    setShowTermsModal(false);
    setShowSignaturePad(false);
    form.reset();
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Plus className="w-4 sm:mr-2" />
            <span className="hidden sm:inline-block">
              {t("members.addMember")}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-scroll w-full">
          <SheetHeader>
            <div className="flex gap-2">
              <SheetTitle>{t("members.addMember")}</SheetTitle>
            </div>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8 flex flex-col"
            >
              <InputField
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                label={t("newMember.nameFieldLabel")}
                name="name"
              />
              <InputField
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                label={t("newMember.surnameFieldLabel")}
                name="surname"
              />
              <DateField
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                label={t("newMember.dateFieldLabel")}
                name="birth_date"
                day={day}
                month={month}
                year={year}
                setDay={setDay}
                setMonth={setMonth}
                setYear={setYear}
              />
              <Combobox
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                name="country"
                label={t("newMember.countryFieldLabel")}
                data={[
                  i18n.language === "it" ? "__Altro__" : "__Other__",
                  ...countries.map((entry) => entry.en),
                ]}
                search={countrySearch}
                setSearch={setCountrySearch}
              />
              <Combobox
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                name="birth_place"
                label={t("newMember.cityFieldLabel")}
                data={[
                  i18n.language === "it" ? "__Altro__" : "__Other__",
                  ...cities,
                ]}
                search={citySearch}
                setSearch={setCitySearch}
                value={isItaly ? "" : country || ""}
                disabled={!isItaly}
              />
              <SelectField
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                name="doc_type"
                label={t("newMember.docTypeFieldLabel")}
                data={documents.map((entry) =>
                  i18n.language === "it" ? entry.it : entry.en,
                )}
              />
              <InputField
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                label={t("newMember.docIdFieldLabel")}
                name="doc_id"
              />
              <InputField
                // @ts-expect-error - due to FormData cannot be exported
                form={form}
                label={t("newMember.emailFieldLabel")}
                name="email"
                type="email"
              />
              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="w-full mt-8"
              >
                {t("consents.acceptTerms")}
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t("consents.title")}</DialogTitle>
          </DialogHeader>
          <ConsentForm onProceed={handleTermsAccepted} />
        </DialogContent>
      </Dialog>

      {/* Signature Pad Modal */}
      <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("signature.save")}</DialogTitle>
          </DialogHeader>
          <SignaturePad
            onSave={handleSignatureSaved}
            onClear={handleSignatureCleared}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
