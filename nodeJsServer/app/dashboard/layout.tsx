import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";

const poppins = Poppins({
    subsets: ["latin"],
    display: "swap",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "RESQ",
    description: "RESQ dashboard",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body
                className={cn(
                    `${poppins.className}`,
                    "flex flex-col items-center bg-background"
                )}
            >
                <Header></Header>
                {children}
            </body>
        </html>
    );
}
