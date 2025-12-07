import { useState, useRef } from "react";
import { useCardUploadMutation } from "@/hooks/use-card-upload-mutation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Card upload component with drag-drop support
 * Accepts .xlsx files and auto-imports after upload
 */
export function CardUpload() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useCardUploadMutation();

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert(t("cards.invalidFileType"));
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.uploadTitle")}</CardTitle>
        <CardDescription>{t("cards.uploadDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag-drop area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-neutral-7 hover:border-neutral-8 dark:border-neutral-6 dark:hover:border-neutral-7"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet className="h-12 w-12 text-primary" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">{t("cards.selectFile")}</p>
              <p className="text-xs text-muted-foreground">{t("cards.dragDrop")}</p>
            </div>
          )}
        </div>

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className="w-full"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("cards.importing")}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t("cards.uploadAndImport")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
