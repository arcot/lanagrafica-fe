import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import consentsData from "@/assets/consents.json";

interface ConsentItem {
  id: number;
  text: string;
}

interface ConsentFormProps {
  onProceed: () => void;
}

export function ConsentForm({ onProceed }: ConsentFormProps) {
  const { t } = useTranslation();
  const [consents] = useState<ConsentItem[]>(consentsData);
  const [checkedConsents, setCheckedConsents] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  // Update all consents when selectAll changes
  useEffect(() => {
    const newCheckedConsents: Record<number, boolean> = {};
    consents.forEach((consent) => {
      newCheckedConsents[consent.id] = selectAll;
    });
    setCheckedConsents(newCheckedConsents);
  }, [selectAll, consents]);

  const handleCheckboxChange = (id: number) => {
    setCheckedConsents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isFormValid = consents.every((consent) => checkedConsents[consent.id]);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {consents.map((consent) => (
          <div key={consent.id} className="flex items-start space-x-3">
            <Checkbox
              id={`consent-${consent.id}`}
              checked={!!checkedConsents[consent.id]}
              onCheckedChange={() => handleCheckboxChange(consent.id)}
            />
            <label
              htmlFor={`consent-${consent.id}`}
              className="text-sm leading-relaxed cursor-pointer"
            >
              {consent.text}
            </label>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 pt-4 border-t">
        <Button onClick={handleSelectAll} variant="outline" type="button" className="w-full">
          {selectAll ? t("consents.deselectAll") : t("consents.selectAll")}
        </Button>
        <Button onClick={onProceed} disabled={!isFormValid} type="button" className="w-full">
          {t("consents.proceedToSignature")}
        </Button>
      </div>
    </div>
  );
}
