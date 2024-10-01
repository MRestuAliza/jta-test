import Link from "next/link";
import { Home, List, ListPlus, Package, Users2, MailPlus, Mail, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, usePathname } from 'next/navigation';

const Sidebar = () => {
    const router = usePathname();
    const routerSegements = router.split("/").filter(segments => segments);
    const path = `/${routerSegements[0]}`;


    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link href="#" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                    <Package className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Acme Inc</span>
                </Link>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboard" className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === "/dashboard" ? "bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}>
                            <Home className="h-5 w-5" />
                            <span className="sr-only">Dashboard</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Dashboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/departements"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === "/departements" ? " bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}
                        >
                            <List className="h-5 w-5" />
                            <span className="sr-only">Departements</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Departements</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/add-departements"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === "/add-departements" ? "bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}
                        >
                            <ListPlus className="h-5 w-5" />
                            <span className="sr-only">Add Departements</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Add Departements</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/users"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === "/users" ? "bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}
                        >
                            <Users2 className="h-5 w-5" />
                            <span className="sr-only">Users</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Users</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/saran"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === "/saran" ? "bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}
                        >
                            <Mail className="h-5 w-5" />
                            <span className="sr-only">Saran</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Saran</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/add-saran"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${path === "/add-saran" ? "bg-accent" : "text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"}`}
                        >
                            <MailPlus className="h-5 w-5" />
                            <span className="sr-only">Tambah group saran</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Tambah group saran</TooltipContent>
                </Tooltip>
                
            </nav>
        </aside>
    )
};

export default Sidebar;