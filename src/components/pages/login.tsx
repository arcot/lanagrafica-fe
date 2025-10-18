import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/ui/logo";

export function Login() {
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="mx-auto flex-grow flex flex-col items-center sm:max-w-md">
        <CardHeader className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle>{t("login.title")}</CardTitle>
        </CardHeader>
        <CardContent className="w-full max-w-md">
          <div className="space-y-6 flex flex-col">
            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              {t("login.loginWithAuth0")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
