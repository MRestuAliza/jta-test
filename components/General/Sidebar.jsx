"use client";

import Link from "next/link";
import { Home, List, ListPlus, Package, Users2, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";

const Sidebar = () => {
    const router = usePathname();
    const routerSegments = router.split("/").filter(segment => segment);
    const path = `/${routerSegments[0]}`;
    const { data: session } = useSession();
    const role = session?.user?.role;

    const menuItems = {
        admin: [
            { href: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Beranda" },
            { href: "/departements", icon: <List className="h-5 w-5" />, label: "Departements" },
            { href: "/add-departements", icon: <ListPlus className="h-5 w-5" />, label: "Add Departements" },
            { href: "/users", icon: <Users2 className="h-5 w-5" />, label: "Users" },
            { href: "/saran", icon: <Mail className="h-5 w-5" />, label: "Saran" },
        ],
        mahasiswa: [
            { href: "/mahasiswa/dashboard", icon: <Home className="h-5 w-5" />, label: "Beranda" },
            { href: "/mahasiswa/saran", icon: <Mail className="h-5 w-5" />, label: "Saran" },
        ]
    };
    const roleBasedItems = role === 'Mahasiswa' ? menuItems.mahasiswa : menuItems.admin;

    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link href="#" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                    <Package className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Acme Inc</span>
                </Link>
                {roleBasedItems.map(({ href, icon, label }) => (
                    <Tooltip key={href}>
                        <TooltipTrigger asChild>
                            <Link
                                href={href}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === href ? "bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}
                            >
                                {icon}
                                <span className="sr-only">{label}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
