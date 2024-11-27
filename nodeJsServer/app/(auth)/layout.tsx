import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins({
    subsets: ["latin"],
    display: "swap",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "RESQ",
    description: "RESQ dashboard",
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
                {children}
            </body>
        </html>
    );
}
