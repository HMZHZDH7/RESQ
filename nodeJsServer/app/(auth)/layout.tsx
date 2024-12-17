import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import NextTopLoader from "nextjs-toploader";
import UrlAlertReader from "@/components/url-alert-reader";
import { AlertProvider } from '@/components/contexts/AlertContext';
import AlertContainer from "@/components/alert-container";

const poppins = Poppins({
    subsets: ["latin"],
    display: "swap",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "RESQ",
    description: "RESQ",
};

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body
                className={cn(
                    `${poppins.className}`,
                    "bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center py-[50px]"
                )}
            >
                <NextTopLoader color="#FFFFFF" showSpinner={false} />
                <AlertProvider>
                    <UrlAlertReader />
                    <AlertContainer />
                    {children}
                </AlertProvider>
            </body>
        </html>
    );
}
