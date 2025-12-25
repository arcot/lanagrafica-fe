import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear: () => void;
}

export function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const { t } = useTranslation();
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    onClear();
  };

  const handleSave = () => {
    if (signatureRef.current) {
      const canvas = signatureRef.current.getCanvas();
      const imageData = canvas.toDataURL();
      onSave(imageData);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="border-2 border-border rounded-md overflow-hidden bg-gray-50">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 200,
            className: "signature-canvas bg-gray-50",
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleClear} variant="outline" type="button">
          {t("signature.clear")}
        </Button>
        <Button onClick={handleSave} type="button">
          {t("signature.save")}
        </Button>
      </div>
    </div>
  );
}
