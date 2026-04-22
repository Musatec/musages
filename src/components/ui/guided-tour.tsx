"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { completeOnboardingAction } from "@/lib/actions/auth";

export function GuidedTour() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, update } = useSession();

    useEffect(() => {
        // Fallback for safety or unauthenticated state
        const localCompleted = localStorage.getItem("mindos_onboarding_completed");
        const dbCompleted = session?.user?.hasSeenOnboarding;

        const isCompleted = localCompleted === "true" || dbCompleted === true;
        
        const finishTour = async () => {
            localStorage.setItem("mindos_onboarding_completed", "true");
            if (session?.user && !dbCompleted) {
                await completeOnboardingAction();
                // Force update session to avoid restarting on next page load
                update({ hasSeenOnboarding: true });
            }
        };

        // Start tour only on Dashboard if not completed
        if (!isCompleted && pathname.includes("/dashboard")) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: "C'est parti !",
                nextBtnText: "Suivant",
                prevBtnText: "Retour",
                steps: [
                    { 
                        element: "#sidebar-dashboard", 
                        popover: { 
                            title: "Bienvenue dans l'Empire ! 🚀", 
                            description: "Voici votre centre de commandement. C'est ici que vous surveillez la santé de votre business en temps réel.",
                            side: "right",
                            align: 'start'
                        } 
                    },
                    { 
                        element: ".bg-gradient-to-br.from-primary\\/10", // Targets the OnboardingWizard container
                        popover: { 
                            title: "Votre Mission de Lancement 🎯", 
                            description: "Suivez ces étapes pour configurer votre boutique à 100%. Chaque étape complétée vous rapproche du succès.",
                            side: "bottom",
                            align: 'start'
                        } 
                    },
                    { 
                        element: "#sidebar-inventory", 
                        popover: { 
                            title: "Vos Richesses 📦", 
                            description: "C'est ici que vous gérez votre stock. Vous pouvez ajouter des produits, suivre les arrivages et gérer les fournisseurs.",
                            side: "right",
                            align: 'start'
                        } 
                    },
                    { 
                        element: "#sidebar-sales", 
                        popover: { 
                            title: "Le Terminal Alpha 🧾", 
                            description: "Prêt à encaisser ? Cliquez ici pour ouvrir le Point de Vente et réaliser votre première vente.",
                            side: "right",
                            align: 'start',
                            onNextClick: (element, step, { driver }) => {
                                driver.destroy();
                                router.push("/sales");
                            }
                        }
                    }
                ],
                onDestroyed: () => {
                    // Si l'utilisateur quitte ici, on considère que c'est fini pour cette partie
                    // On pourrait aussi choisir de ne pas appeler finishTour() ici pour forcer à finir sur POS
                }
            });

            driverObj.drive();
        }

        // Second part of the tour: The POS
        if (!isCompleted && pathname.includes("/sales")) {
            setTimeout(() => {
                const driverObj = driver({
                    showProgress: true,
                    animate: true,
                    steps: [
                        { 
                            element: "#pos-search-input", 
                            popover: { 
                                title: "Vitesse Éclair ⚡", 
                                description: "Scannez un code-barres ou tapez le nom d'un produit. Le terminal est optimisé pour être utilisé sans souris.",
                                side: "bottom",
                                align: 'start'
                            } 
                        },
                        { 
                            element: "[id^='pos-product-']", 
                            popover: { 
                                title: "Sélectionnez l'Article", 
                                description: "Cliquez sur un produit pour l'ajouter instantanément au panier.",
                                side: "bottom",
                                align: 'start'
                            } 
                        },
                        { 
                            element: "#pos-checkout-btn", 
                            popover: { 
                                title: "Encaissements & Succès 💸", 
                                description: "Une fois le panier prêt, validez la vente. C'est ici que votre chiffre d'affaires prend vie !",
                                side: "left",
                                align: 'start'
                            } 
                        }
                    ],
                    onDestroyed: () => {
                        finishTour();
                    }
                });

                driverObj.drive();
            }, 1000); // Wait for POS to load products
        }
    }, [pathname, router, session, update]);

    return null;
}
