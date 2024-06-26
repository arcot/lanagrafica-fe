import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  fromCamelToSnakeCase,
  genCardNumber,
  getExpirationDate,
  getRegistrationDate,
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
import { Member, MemberDTO } from "@/types";

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

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.required") }),
    surname: z.string().min(1, { message: t("validation.required") }),
    birthDate: z
      .string()
      .min(1, { message: t("validation.required") })
      .refine(isValidISODate, { message: t("validation.wrongDate") })
      .refine(isAdult, { message: t("validation.notAdult") }),
    birthPlace: z.string().min(1, { message: t("validation.required") }),
    country: z.string().min(1, { message: t("validation.required") }),
    docType: z.string().min(1, { message: t("validation.required") }),
    docId: z.string().min(1, { message: t("validation.required") }),
    email: z.string(),
  });

  const form = useForm<Member>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      surname: "",
      birthDate: "",
      birthPlace: "",
      country: "Italy",
      docType: "",
      docId: "",
      email: "",
    },
  });

  const country = form.watch("country");
  const isItaly = country === "Italy";

  function serializeForInsert(row: Member): MemberDTO {
    const updatedRow: Member = {
      ...row,
      registrationDate: getRegistrationDate(),
      expirationDate: getExpirationDate(),
      cardNumber: genCardNumber(),
      isActive: true,
      isDeleted: false,
    };

    return fromCamelToSnakeCase(updatedRow);
  }

  async function onSubmit(values: Member) {
    const newMember = serializeForInsert(values);
    await insertMutation.mutate({
      details: newMember,
      name: newMember.name || "",
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
    form.reset();
  }

  return (
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex flex-col"
          >
            <InputField
              form={form}
              label={t("newMember.nameFieldLabel")}
              name="name"
            />
            <InputField
              form={form}
              label={t("newMember.surnameFieldLabel")}
              name="surname"
            />
            <DateField
              form={form}
              label={t("newMember.dateFieldLabel")}
              name="birthDate"
              day={day}
              month={month}
              year={year}
              setDay={setDay}
              setMonth={setMonth}
              setYear={setYear}
            />
            <Combobox
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
              form={form}
              name="birthPlace"
              label={t("newMember.cityFieldLabel")}
              data={[
                i18n.language === "it" ? "__Altro__" : "__Other__",
                ...cities,
              ]}
              search={citySearch}
              setSearch={setCitySearch}
              value={isItaly ? "" : country}
              disabled={!isItaly}
            />
            <SelectField
              form={form}
              name="docType"
              label={t("newMember.docTypeFieldLabel")}
              data={documents.map((entry) =>
                i18n.language === "it" ? entry.it : entry.en,
              )}
            />
            <InputField
              form={form}
              label={t("newMember.docIdFieldLabel")}
              name="docId"
            />
            <InputField
              form={form}
              label={t("newMember.emailFieldLabel")}
              name="email"
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="w-full mt-8"
            >
              {t("newMember.submit")}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
