"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { Search} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/libs/dateUtils';
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
import { useSession } from "next-auth/react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import withAuth from '@/libs/withAuth';


function AdvicePage() {
    const { status, data: session } = useSession();
    const [advices, setAdvices] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            fetchAdvice();
        }
    }, [status]);

    const fetchAdvice = async () => {
        try {
            let response;
            if (session?.user?.role.startsWith("Admin")) {
                response = await fetch(`/api/group-saran?id=${session?.user?.departementId}&role=${session?.user?.role}&type=${session?.user?.type}`);
            } else {
                response = await fetch(`/api/group-saran`);
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("Data:", data.data);


            setAdvices(data.data);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    }

    const advicesArray = Object.values(advices).filter(item => typeof item === "object" && item.name && item.type);
    const filteredAdvices = advicesArray.filter(advice => {
        console.log("Processing advice:", advice);
        const matchesType = filter === "all" || advice.type === filter;
        const searchQueryLower = searchQuery.toLowerCase();
        const matchesSearchQuery = advice.name.toLowerCase().includes(searchQueryLower);

        return matchesType && matchesSearchQuery;
    });

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Saran"} />
                <main className='p-4 space-y-4'>
                    <Tabs defaultValue="all" onValueChange={setFilter}>
                        <div>
                            {session?.user?.type !== 'Prodi' && (
                                <TabsList className="mb-2">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    {session?.user?.role === 'Super Admin' && (
                                        <TabsTrigger value="Universitas" className="hidden sm:flex">
                                            Universitas
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger value="Fakultas">Fakultas</TabsTrigger>
                                    <TabsTrigger value="Prodi">Prodi</TabsTrigger>
                                </TabsList>
                            )}
                            <Card>
                                <CardHeader className="flex flex-col items-start gap-2 md:flex-row md:items-center">
                                    <div className="grid gap-2">
                                        <CardTitle>List Saran</CardTitle>
                                    </div>
                                    <div className="relative ml-auto w-full flex-1 md:grow-0">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                                {filteredAdvices.length > 0 ? (
                                                    filteredAdvices
                                                        .sort((a, b) => {
                                                            const order = ["Universitas", "Fakultas", "Prodi"];
                                                            return order.indexOf(a.type) - order.indexOf(b.type);
                                                        })
                                                        .map((advice) => (
                                                            <TableRow key={advice._id}>
                                                                <TableCell>
                                                                    <div className="font-medium">{advice.name}</div>
                                                                </TableCell>
                                                                <TableCell className="hidden sm:table-cell">
                                                                    {advice.link_advice}
                                                                </TableCell>
                                                                <TableCell className="hidden sm:table-cell">
                                                                    <Badge className="text-xs" variant="secondary">
                                                                        {advice.type}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell">
                                                                    {formatDate(advice.updated_at)}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button>
                                                                        <Link className='w-full' href={`/saran/${advice.link_advice}`}>Buka</Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center">
                                                            <div className="text-muted-foreground"> Data "{searchQuery}" tidak ditemukan</div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
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

export default withAuth(AdvicePage);