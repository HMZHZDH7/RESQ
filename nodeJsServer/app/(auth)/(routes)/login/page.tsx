import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ToggleInput } from "@/components/toggle-input";
import Link from "@/components/link";
import Image from "next/image";

const LogInPage = () => {
    return (
        <form
            action="/auth"
            method="post"
            className="w-[445px] bg-background rounded-[15px] flex flex-col gap-[22px] p-[40px] items-center justify-center"
        >
            <div className="flex gap-[10px] items-center">
                <Image src="/img/resq-logo.png" alt="resq + logo" width={220} height={63}></Image>
            </div>
            <h2 className="text-2xl font-bold text-primary text-center">
                Log in to the <br />dashboard
            </h2>
            <Input
                type="text"
                name="username"
                className="w-full"
                placeholder="Username"
                required
            />
            <Input
                type="password"
                name="password"
                className="w-full"
                placeholder="Password"
                required
            />
            <ToggleInput name="rememberMe" label="Remember me" />
            <Button type="submit" className="w-full mt-[22px]">
                Login
            </Button>
            <p className="uppercase font-bold text-gray-dark text-sm">
                Or
            </p>
            <Link href="/auth/as-guest" className="font-semibold" prefetch={false}>Continue as guest</Link>
        </form>
    );
};

export default LogInPage;
