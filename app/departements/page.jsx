"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { Search, MoreVertical } from "lucide-react";
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import Swal from 'sweetalert2';
import { Label } from "@/components/ui/label";
import withAuth from '@/libs/withAuth';
import { formatDate } from '@/libs/dateUtils';

function DepartmentPage() {
    const [departments, setDepartments] = useState([]);
    const { status, data: session } = useSession();
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetchDepartments();
        }
    }, [status]);

    const fetchDepartments = async () => {
        try {
            let response;
            let combinedData = []
            if (session?.user?.role.startsWith('Admin')) {
                response = await fetch(`/api/institusi?id=${session?.user?.departementId}&role=${session?.user?.role}`);
                const data = await response.json();
                if (session?.user?.type === 'Prodi') {
                    combinedData = data.data.prodi_websites || [];
                } else {
                    combinedData = [
                        ...(data.data.fakultas_websites || []),
                        ...(data.data.prodi_list || []),
                    ];
                }
            } else {
                response = await fetch(`/api/institusi?id=${process.env.NEXT_PUBLIC_UNIVERSITY_ID}`);
                const data = await response.json();
                combinedData = [
                    ...(data.data.university_websites || []),
                    ...(data.data.fakultas_list || []),
                ];
            }
            setDepartments(combinedData);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteDepartment = async (id) => {
        try {
            const response = await fetch(`/api/institusi?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setDepartments(prevDepartments => prevDepartments.filter(department => department._id !== id && department.id !== id));
                Swal.fire('Berhasil!', 'Data berhasil dihapus.', 'success');
            } else {
                Swal.fire('Gagal!', 'Gagal menghapus data.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
    };

    const updateDepartment = async (id) => {
        try {
            const department = departments.find(dept => dept._id === id || dept.id === id);
            console.log("Department a:", department);
            if (!department) {
                throw new Error("Department not found");
            }

            const updatedData = {
                name: department.name,
                link: department.link,
            };

            let response;

            if (department.link_advice) {
                response = await fetch(`/api/website?id=${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
            } else {
                response = await fetch(`/api/institusi?id=${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
            }

            if (response.ok) {
                const updatedDepartment = await response.json();
                setDepartments(prevDepartments => {
                    return prevDepartments.map(department =>
                        department._id === id || department.id === id
                            ? updatedDepartment.data
                            : department
                    );
                });
                Swal.fire('Sukses Mengupdate Data', '', 'success');
            } else {
                const errorData = await response.json();
                Swal.fire(`Error: ${errorData.message}`, '', 'error');
            }
        } catch (error) {
            Swal.fire('An error occurred while updating the department', '', 'error');
        }
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteDepartment(deleteId);
            setDeleteId(null);
        }
    };

    const handleUpdate = () => {
        if (editId) {
            updateDepartment(editId);
            setEditId(null);
        }
    };

    const handleInputChange = (e, field) => {
        const { value } = e.target;
        setDepartments(prevDepartments => {
            const updatedDepartments = prevDepartments.map(department => {
                if (department._id === editId || department.id === editId) {
                    return { ...department, [field]: value };
                }
                return department;
            });
            return updatedDepartments;
        });
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departement"} />
                <main className='p-4 space-y-4'>
                    <div>
                        <Card>
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle className="">List Departemen</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="hidden sm:table-cell">Link</TableHead>
                                                <TableHead className="hidden sm:table-cell">Level</TableHead>
                                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                                <TableHead className="text-right"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {departments.map((department) => {
                                                return (
                                                    <TableRow key={department._id || department.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{department.name}</div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            {department.link || "-"}
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <Badge className="text-xs" variant="secondary">
                                                                {department.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {department.updated_at
                                                                ? formatDate(department.updated_at)
                                                                : "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                                        <span className="sr-only">More</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        {department.link_advice ? (
                                                                            <Link
                                                                                className="w-full"
                                                                                href={`/saran/${department.link_advice}`}
                                                                            >
                                                                                Open
                                                                            </Link>
                                                                        ) : (
                                                                            <Link
                                                                                className="w-full"
                                                                                href={`/departements/${department._id || department.id}`}
                                                                            >
                                                                                Open
                                                                            </Link>
                                                                        )}
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            setEditId(department._id || department.id)
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-500"
                                                                        onClick={() =>
                                                                            setDeleteId(department._id || department.id)
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
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
                        <AlertDialogTitle>Konfirmasi Menghapus {deleteId && (departments.find(dept => dept._id === editId || dept.id === editId)?.name || "")}</AlertDialogTitle>
                        <AlertDialogDescription>Apakah Anda yakin ingin menghapus data ini? Semua data program studi, saran, dan website yang terkait juga akan dihapus</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Konfirmasi Update */}
            <AlertDialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Konfirmasi Mengedit {editId && (departments.find(dept => dept._id === editId || dept.id === editId)?.name || "")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="grid gap-3">
                            {(() => {
                                const department = editId && departments.find(dept => dept._id === editId || dept.id === editId);
                                if (!department) return null;
                                if (department.link_advice) {
                                    return (
                                        <>
                                            <div className='space-y-2'>
                                                <Label htmlFor="name">Nama Website</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={department.name || ''}
                                                    onChange={(e) => handleInputChange(e, 'name')}
                                                    required
                                                    placeholder="Masukkan nama website"
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label htmlFor="link">Link Website</Label>
                                                <Input
                                                    id="link"
                                                    name="link"
                                                    value={department.link || ''}
                                                    onChange={(e) => handleInputChange(e, 'link')}
                                                    required
                                                    placeholder="Masukkan link website"
                                                />
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <div className='space-y-2'>
                                            <Label htmlFor="name">Nama Fakultas</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={department.name || ''}
                                                onChange={(e) => handleInputChange(e, 'name')}
                                                required
                                                placeholder="Masukkan nama fakultas"
                                                className="w-full"
                                            />
                                        </div>
                                    );
                                }
                            })()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="justify-center">
                        <AlertDialogCancel onClick={() => setEditId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdate}>Update</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}

export default withAuth(DepartmentPage);
