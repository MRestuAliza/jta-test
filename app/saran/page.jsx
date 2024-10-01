"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { Search, MoreVertical } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
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
import Swal from 'sweetalert2';

function AdvicePage() {
    const { status } = useSession();
    const [advices, setAdvices] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState(null);

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

    const deleteAdvice = async (id) => {
        try {
            const response = await fetch(`/api/group-saran?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setAdvices(advices.filter((advice) => advice._id !== id));

            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete advice:', error);
        }
    }

    const handleDelete = () => {
        if (deleteId) {
            deleteAdvice(deleteId);
            setDeleteId(null);
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: 'Sukses Menghapus Data',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erorr',
                text: 'Gagal Menghapus Data',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    }

    const filteredAdvices = advices.filter(advice => {
        const matchesType = filter === "all" || advice.type === filter
        const searchQueryLower = searchQuery.toLowerCase();

        const matchesSearchQuery = advice.name.toLowerCase().includes(searchQueryLower) ||
            advice.type.toLowerCase().includes(searchQueryLower) ||
            (advice.fakultas_id && advice.fakultas_id.name.toLowerCase().includes(searchQueryLower)) ||
            (advice.university_id && advice.university_id.name.toLowerCase().includes(searchQueryLower)) ||
            (advice.prodi_id && advice.prodi_id.name.toLowerCase().includes(searchQueryLower));

        return matchesType && matchesSearchQuery;
    });

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departments"} />
                <main className='p-4 space-y-4'>
                    <Tabs defaultValue="all" onValueChange={setFilter}>
                        <div>
                            <TabsList className="mb-2">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="Universitas" className="hidden sm:flex">
                                    Universitas
                                </TabsTrigger>
                                <TabsTrigger value="Fakultas">Fakultas</TabsTrigger>
                                <TabsTrigger value="Prodi">Prodi</TabsTrigger>
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
                                                    <TableHead className="hidden sm:table-cell">
                                                        Fakultas
                                                    </TableHead>
                                                    <TableHead className="hidden md:table-cell">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="text-right"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredAdvices.length > 0 ? (
                                                    filteredAdvices.map((advice) => (
                                                        <TableRow key={advice._id}>
                                                            <TableCell>
                                                                <div className="font-medium">{advice.name}</div>
                                                            </TableCell>
                                                            <TableCell className="hidden sm:table-cell">
                                                                {advice.link}
                                                            </TableCell>
                                                            <TableCell className="hidden sm:table-cell">
                                                                <Badge className="text-xs" variant="secondary">
                                                                    {advice.type === 'Universitas' && advice.university_id ? advice.university_id.name : null}
                                                                    {advice.type === 'Fakultas' && advice.fakultas_id ? advice.fakultas_id.name : null}
                                                                    {advice.type === 'Prodi' && advice.prodi_id ? advice.prodi_id.name : null}
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
                                                                        <DropdownMenuItem>
                                                                            <Link className='w-full' href={`/departements/${advice._id}`}>Edit</Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className='text-red-500' onClick={() => setDeleteId(advice._id)}>Delete</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center">
                                                            Data "{searchQuery}" tidak ditemukan
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

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Menghapus {filteredAdvices.find(department => department._id === deleteId)?.name}</AlertDialogTitle>
                        <AlertDialogDescription>Apakah Anda yakin ingin menghapus data ini? Semua saran yang terkait juga akan dihapus</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default AdvicePage;
