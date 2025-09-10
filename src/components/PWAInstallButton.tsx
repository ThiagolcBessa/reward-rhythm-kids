import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "@/hooks/use-toast";

export const PWAInstallButton = () => {
  const { isInstallable, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast({
        title: "App installed!",
        description: "Daily Task Kids has been installed to your device.",
      });
    }
  };

  if (!isInstallable) return null;

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
};