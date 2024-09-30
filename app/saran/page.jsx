"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

function AdvicePage() {
    const { status } = useSession();
    const [advices, setAdvices] = useState([]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchAdvice();
        }
    }, [status]);

    const fetchAdvice = async () => {
        try {
            const response = await fetch(`/api/group-saran`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAdvices(data.data);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departments"} />
                <main className='p-4 space-y-4'>
                    <Tabs defaultValue="all">
                        <div>
                            <TabsList className="mb-2">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="draft">Draft</TabsTrigger>
                                <TabsTrigger value="archived" className="hidden sm:flex">
                                    Archived
                                </TabsTrigger>
                            </TabsList>
                            <Card>
                                <CardHeader className="flex flex-row items-center">
                                    <div className="grid gap-2">
                                        <CardTitle className="">List Departemen</CardTitle>
                                    </div>
                                    <div className="relative ml-auto flex-1 md:grow-0">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search..."
                                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="hidden sm:table-cell">
                                                        Link Saran
                                                    </TableHead>
                                                    <TableHead className="hidden sm:table-cell">
                                                        Level
                                                    </TableHead>
                                                    <TableHead className="hidden md:table-cell">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="text-right"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {advices.map((advice) => (
                                                    <TableRow key={advice._id}>
                                                        <TableCell>
                                                            <div className="font-medium">{advice.name}</div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            {advice.link}
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <Badge className="text-xs" variant="secondary">
                                                                {advice.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {new Date(advice.updated_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="outline" className="h-8 w-8">
                                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                                        <span className="sr-only">More</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Link className='w-full' href={`/departements/${advice._id}`}>Open</Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}

export default AdvicePage;
