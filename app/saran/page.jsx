"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/libs/dateUtils';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
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
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (status === "authenticated") {
            fetchAdvice(currentPage);
        }
    }, [status, currentPage, filter]);

    const fetchAdvice = async (page) => {
        setIsLoading(true);
        try {
            let response;
            if (session?.user?.role.startsWith("Admin")) {
                response = await fetch(
                    `/api/group-saran?id=${session?.user?.departementId}&role=${session?.user?.role}&type=${session?.user?.type}&page=${page}&limit=10`
                );
            } else {
                response = await fetch(`/api/group-saran?page=${page}&limit=10`);
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAdvices(data.data);
            setTotalPages(Math.ceil(data.total / data.limit));
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const advicesArray = Object.values(advices).filter(item => typeof item === "object" && item.name && item.type);
    const filteredAdvices = advicesArray.filter(advice => {
        const matchesType = filter === "all" || advice.type === filter;
        const searchQueryLower = searchQuery.toLowerCase();
        const matchesSearchQuery = advice.name.toLowerCase().includes(searchQueryLower);

        return matchesType && matchesSearchQuery;
    });
    
    const LoadingOverlay = () => (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-md bg-background p-4 shadow-md">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading data...</span>
            </div>
        </div>
    );
    
    const CustomPagination = () => {
        const handlePageChange = (page) => {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        };

        const renderPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;
            const halfVisible = Math.floor(maxVisiblePages / 2);
            
            let startPage = Math.max(currentPage - halfVisible, 1);
            let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
            
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(endPage - maxVisiblePages + 1, 1);
            }

            if (startPage > 1) {
                pages.push(
                    <PaginationItem key={1}>
                        <PaginationLink 
                            onClick={() => handlePageChange(1)}
                            isActive={currentPage === 1}
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                );
                if (startPage > 2) {
                    pages.push(
                        <PaginationItem key="start-ellipsis">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={currentPage === i}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push(
                        <PaginationItem key="end-ellipsis">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
                pages.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink 
                            onClick={() => handlePageChange(totalPages)}
                            isActive={currentPage === totalPages}
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            return pages;
        };

        return (
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isLoading ? "pointer-events-none" : ""}`}
                        />
                    </PaginationItem>
                    
                    {renderPageNumbers()}
                    
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isLoading ? "pointer-events-none" : ""}`}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Saran"} />
                <main className='p-4 space-y-4'>
                    <Tabs defaultValue="all" onValueChange={(value) => {
                        setFilter(value);
                        setCurrentPage(1);
                    }}>
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
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    {isLoading && <LoadingOverlay />}
                                    <div className={`transition-all duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
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
                                                                            <Link className='w-full' href={`/saran/${advice.link_advice}`}>
                                                                                Buka
                                                                            </Link>
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center">
                                                                <div className="text-muted-foreground">
                                                                    Data &quot;{searchQuery}&quot; tidak ditemukan
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <CustomPagination />
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