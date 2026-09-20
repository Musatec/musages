import { DaaraLoadingScreen } from "@/components/ui/loading-screen";

export default function GlobalLoading() {
    return <DaaraLoadingScreen fullScreen={false} message="Chargement du module..." />;
}
