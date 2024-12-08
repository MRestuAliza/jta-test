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
    ChevronRight,
    Users2,
} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
    BreadcrumbPage,
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
import { useDepartment } from '@/contexts/DepartmentContext';

const Header = () => {
    const { status, data: session } = useSession();
    const router = usePathname();
    // const pathSegments = router.split("/").filter(segments => segments);
    const pathSegments = router.split("/").filter(segments => segments && segments !== "board");
    const path = `/${pathSegments[0]}`;
    const [photoURL, setPhotoURL] = useState();
    const role = session?.user?.role;
    const { getNameFromId } = useDepartment();

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

    const fetchDepartmentName = async (id) => {
        try {
            const response = await fetch(`/api/institusi?id=${id}`);
            const data = await response.json();

            if (response.ok && data.data) {
                const name = data.data.fakultas_websites?.[0]?.name ||
                    data.data.prodi_websites?.[0]?.name ||
                    data.data.university_websites?.[0]?.name ||
                    id;
                setDepartmentName(name);
            }
        } catch (error) {
            console.error("Error fetching department name:", error);
            setDepartmentName(id);
        }
    };

    const getBreadcrumbLabel = (segment) => {
        switch (segment) {
            case 'dashboard':
                return 'Dashboard';
            case 'departements':
                return 'Departements';
            case 'add-departements':
                return 'Add Departements';
            case 'users':
                return 'Users';
            case 'saran':
                return 'Saran';
            case 'settings':
                return 'Settings';
            case 'mahasiswa':
                return 'Mahasiswa';
            default:
                return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        }
    };

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
            <Breadcrumb className="hidden md:flex max-w-full overflow-hidden">
                {/* <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Beranda</BreadcrumbLink>
                    </BreadcrumbItem>

                    {pathSegments.length > 2 && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1">
                                        <BreadcrumbEllipsis className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {pathSegments.slice(0, -1).map((segment, index) => (
                                            <DropdownMenuItem key={index}>
                                                <Link
                                                    href={`/${pathSegments.slice(0, index + 1).join('/')}`}
                                                    className="w-full"
                                                >
                                                    {getBreadcrumbLabel(segment)}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </BreadcrumbItem>
                        </>
                    )}

                    {pathSegments.length > 0 && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {pathSegments.length === 1 ? (
                                    <BreadcrumbPage>
                                        {getBreadcrumbLabel(pathSegments[0])}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={`/${pathSegments[0]}`}>
                                        {getBreadcrumbLabel(pathSegments[0])}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </>
                    )}

                    {pathSegments.length > 1 && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {getBreadcrumbLabel(pathSegments[pathSegments.length - 1])}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList> */}
                <BreadcrumbList>
                    {pathSegments.map((segment, index) => {
                        const name = getNameFromId(segment);
                        console.log('Segment:', segment, 'Name:', name); // Untuk debugging
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
                    })}
                </BreadcrumbList>
            </Breadcrumb>
            {/* Mobile breadcrumb */}
            <div className="md:hidden flex items-center space-x-1 text-sm">
                <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Beranda
                </Link>
                {pathSegments.length > 0 && (
                    <>
                        <span className="text-muted-foreground">/</span>
                        {pathSegments.length > 1 ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1">
                                        <BreadcrumbEllipsis className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {pathSegments.slice(0, -1).map((segment, index) => (
                                            <DropdownMenuItem key={index}>
                                                <Link
                                                    href={`/${pathSegments.slice(0, index + 1).join('/')}`}
                                                    className="w-full"
                                                >
                                                    {getBreadcrumbLabel(segment)}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <span className="text-muted-foreground">/</span>
                            </>
                        ) : null}
                        <span className="max-w-[150px] truncate">
                            {getBreadcrumbLabel(pathSegments[pathSegments.length - 1])}
                        </span>
                    </>
                )}
            </div>
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