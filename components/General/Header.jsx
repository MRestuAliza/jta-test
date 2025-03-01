"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from 'react';
import {
    Home,
    Package2,
    PanelLeft,
    Mail,
    List,
    ListPlus,
    ChevronRight,
    Users2,
} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbSeparator,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDepartment } from '@/contexts/DepartmentContext';

const Header = () => {
    const { status, data: session } = useSession();
    const router = usePathname();
    const [photoURL, setPhotoURL] = useState('');
    const { getNameFromId } = useDepartment();
    
    const pathSegments = useMemo(() => {
        return router.split("/").filter(segments => segments && segments !== "board");
    }, [router]);

    const role = session?.user?.role;

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchUserData();
        }
    }, [status, session?.user?.id]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`/api/auth/users/${session.user.id}`);
            const data = await response.json();
            if (response.ok) {
                setPhotoURL(data.user.profilePicture || '');
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const menuItems = useMemo(() => ({
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
    }), []);

    const roleBasedItems = role === 'Mahasiswa' ? menuItems.mahasiswa : menuItems.admin;

    const breadcrumbItems = useMemo(() => {
        return pathSegments.map((segment, index) => {
            const name = getNameFromId(segment);
            return (
                <React.Fragment key={segment}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${pathSegments.slice(0, index + 1).join('/')}`}>
                            {name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
            );
        });
    }, [pathSegments, getNameFromId]);

    return (
        <header className="sticky justify-between top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="#"
                            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                        >
                            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                            <span className="sr-only">Acme Inc</span>
                        </Link>
                        {roleBasedItems.map(({ href, icon, label }, idx) => (
                            <Link
                                key={idx}
                                href={href}
                                className={`flex items-center gap-4 px-2.5 ${router === href ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {icon}
                                {label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
            
            <Breadcrumb className="hidden md:flex max-w-full overflow-hidden">
                <BreadcrumbList>
                    {breadcrumbItems}
                </BreadcrumbList>
            </Breadcrumb>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <img
                            src={photoURL || "/profile.svg"}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};

export default Header;