"use client";

import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from 'react';
import {
    Home,
    Package2,
    PanelLeft,
    Mail,
    List,
    ListPlus,
    CircleUser,
    Users2,
} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Header = ({ BreadcrumbLinkTitle }) => {
    const { status, data: session } = useSession();
    const router = usePathname();
    const routerSegements = router.split("/").filter(segments => segments);
    const path = `/${routerSegements[0]}`;
    const [photoURL, setPhotoURL] = useState();
    const role = session?.user?.role;

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [session, status]);

    const fetchData = async () => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch(`/api/auth/users/${session.user.id}`);
            const data = await response.json();
            if (response.ok) {
                setPhotoURL(data.user.profilePicture || '');
            } else {
                console.error("Error fetching user data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };
    console.log("ads", photoURL);
    
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
                        {roleBasedItems.map(({ href, icon, label }) => (
                            <Link
                                href={href}
                                className={`flex items-center gap-4 px-2.5 ${path === href ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {icon}
                                {label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="#">{BreadcrumbLinkTitle}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {/* <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild</DropdownMenuTrigger>>
                            <Link href="#">Orders</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Recent Orders</BreadcrumbPage>
                    </BreadcrumbItem> */}
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
                            className="overflow-hidden w-10 w- h-10 rounded-full"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )

};

export default Header;