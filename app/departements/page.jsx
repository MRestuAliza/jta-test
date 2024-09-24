"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { ArrowUpRight, Search, MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"; // Hapus AlertDialogTrigger
import withAuth from '@/libs/withAuth';
import { formatDate } from '@/libs/dateUtils';

function DepartmentPage() {
    const [departments, setDepartments] = useState([]);
    const { status } = useSession();
    const [deleteId, setDeleteId] = useState(null); // State untuk menyimpan ID yang akan dihapus

    useEffect(() => {
        if (status === "authenticated") {
            fetchDepartments();
        }
    }, [status]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`/api/website/university/${process.env.NEXT_PUBLIC_UNIVERSITY_ID}`);
            const data = await response.json();

            const universityData = data.data.websites.filter(item => item.type === 'Universitas');
            const fakultasData = data.data.fakultas;

            const combinedData = [...universityData, ...fakultasData];

            setDepartments(combinedData);
            console.log(combinedData);
        } catch (error) {
            console.error(error);
        }
    }

    const deleteDepartment = async (id) => {
        try {
            const response = await fetch(`/api/departments/fakultas?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDepartments(departments.filter(department => department._id !== id));
                alert('Department deleted successfully');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            alert('An error occurred while deleting the department');
        }
    }

    const handleDelete = () => {
        if (deleteId) {
            deleteDepartment(deleteId);
            setDeleteId(null);
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departments"} />
                <main className='p-4 space-y-4'>
                    <div>
                        <Card x-chunk="dashboard-05-chunk-2">
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
                                                    Link
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
                                            {departments.map((department) => (
                                                <TableRow key={department._id}>
                                                    <TableCell>
                                                        <div className="font-medium">{department.name}</div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        {department.link}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Badge className="text-xs" variant="secondary">
                                                            {department.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {formatDate(department.updated_at)}
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
                                                                    <Link className='w-full' href={`/departements/${department._id}`}>Open</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {/* Ubah ini untuk memicu dialog */}
                                                                <DropdownMenuItem className='text-red-500' onClick={() => setDeleteId(department._id)}>Delete</DropdownMenuItem>
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
                </main>
            </div>

            {/* Dialog Konfirmasi Hapus */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Menghapus {departments.find(department => department._id === deleteId)?.name}</AlertDialogTitle>
                        <AlertDialogDescription>Apakah Anda yakin ingin menghapus data ini? Semua data program studi, saran, dan website yang terkait juga akan dihapus</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default withAuth(DepartmentPage);
