"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { ChevronRight, ChevronUp, MessageSquare, ArrowRight, Trash2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import withAuth from '@/libs/withAuth';
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from 'next/navigation'; // Import useParams
import Swal from 'sweetalert2';
import NotFound from '@/app/not-found';
import DeletePopup from '@/components/General/DeletePopup';

function AdviceGroupPage() {
    const { status } = useSession();
    const router = useRouter();
    const [adviceGroup, setAdviceGroup] = useState(null);
    const { id } = useParams();
    const [advice, setAdvice] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [saranCount, setSaranCount] = useState(0);
    const [deleteGroupId, setDeleteGroupId] = useState(null);
    const [notFound, setNotFound] = useState(false);
    

    useEffect(() => {
        if (status === "authenticated" && id) {
            fetchAdviceGroup(id);
            fetchAdvice(id);
        }
    }, [status, id]);

    const fetchAdviceGroup = async (id) => {
        try {
            const response = await fetch(`/api/group-saran/${id}`);
            if (!response.ok) {
                setNotFound(true);
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAdviceGroup(data.data);
            setSaranCount(data.count);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    };

    const fetchAdvice = async (id) => {
        try {
            const response = await fetch(`/api/saran?id=${id}`);
            if (!response.ok) {
                setNotFound(true);
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAdvice(data.data);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    };

    const deleteAdviceGroup = async (id) => {
        try {
            const response = await fetch(`/api/group-saran?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAdviceGroup(null);
                setAdvice([]); 
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete advice group:', error);
        }
    }

    const deleteAdvice = async (id) => {
        try {
            const response = await fetch(`/api/saran?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAdvice(prevSaran => prevSaran.filter(item => item._id !== id)); // Perbarui saran tanpa menghapus semuanya
                Swal.fire({
                    icon: 'success',
                    title: 'Sukses Menghapus Saran',
                    text: 'Saran berhasil dihapus',
                    timer: 1000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete advice:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal Menghapus Saran',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const handleDeleteAdvice = () => {
        if (deleteId) {
            deleteAdvice(deleteId);
            setDeleteId(null);
        }
    };

    const handleDeleteGroup = () => {
        if (deleteGroupId) {
            deleteAdviceGroup(deleteGroupId);
            setDeleteGroupId(null);
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: 'Sukses Menghapus Data',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                router.push('/saran');
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal Menghapus Data',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    // const handleDelete = () => {
    //     if (deleteGroupId) {
    //         deleteAdviceGroup(deleteGroupId);
    //         setDeleteGroupId(null);
    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Sukses',
    //             text: 'Sukses Menghapus Data',
    //             timer: 1000,
    //             timerProgressBar: true,
    //             showConfirmButton: false,
    //         }).then(() => {
    //             router.push('/saran');
    //         });
    //     } else {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Erorr',
    //             text: 'Gagal Menghapus Data',
    //             timer: 1000,
    //             timerProgressBar: true,
    //             showConfirmButton: false,
    //         });
    //     }
    // }

    const handleCopyLink = (link) => {
        navigator.clipboard.writeText(link).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Copied to clipboard!',
                toast: true,
                position: 'top-right',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        }).catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Failed to copy!',
                toast: true,
                position: 'top-right',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        });
    };

    const handleUpdateStatus = async (saranId, newStatus) => {
        try {
            const response = await fetch(`/api/saran?id=${saranId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const data = await response.json();
            setAdvice(advice.map(item => item._id === saranId ? { ...item, status: newStatus } : item)); // Update status di UI
            Swal.fire({
                icon: 'success',
                title: `Status updated to ${newStatus}`,
                position: 'top-right',
                toast: true,
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update status',
                timer: 1000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    if (notFound) {
        return (
            <><NotFound /></>
        );
    }


    if (!adviceGroup) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        ); // Tampilkan loading jika data belum tersedia
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departments"} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 ">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="sm:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle>{adviceGroup.name}</CardTitle>
                                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                                        <p>Website ini memiliki {saranCount} saran</p>

                                        <div className="grid gap-3 pt-5">
                                            <Label htmlFor="link">Public link</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="link"
                                                    type="text"
                                                    className="w-full"
                                                    defaultValue={`http://localhost:3000/saran/board/${adviceGroup.link}`}
                                                    readOnly
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleCopyLink(`http://localhost:3000/saran/board/${adviceGroup.link}`)}
                                                >
                                                    <Copy className="h-5 w-5" />
                                                    <span className="sr-only">Copy link</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => window.open(`/saran/board/${adviceGroup.link}`, "_blank")}
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                    <span className="sr-only">Open link</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardDescription>

                                </CardHeader>
                                <CardFooter>
                                    <Button variant="link" size="sm" className="text-red-500" onClick={() => setDeleteGroupId(adviceGroup._id)}>
                                        Delete <Trash2 className="ml-1 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                    <div>
                        <div className="grid auto-rows-max items-start gap-4 md:gap-8 max-h-[900px] overflow-y-scroll">
                            {advice.map((item) => (
                                <Card className="sm:col-span-2" key={item._id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
                                                <CardDescription className="text-muted-foreground">{item.description}</CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`${item.status === "new" ? "text-gray-500" : ""} ${item.status === "work in progress" ? "text-blue-400" : ""} ${item.status === "done" ? "text-green-500" : ""} ${item.status === "cancelled" ? "text-red-500" : ""}`}
                                                    >
                                                        {item.status} <ChevronRight className="inline h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateStatus(item._id, "new")}
                                                        className="text-gray-500"
                                                    >
                                                        New
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateStatus(item._id, "work in progress")}
                                                        className="text-blue-400"
                                                    >
                                                        Work In Progress
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateStatus(item._id, "done")}
                                                        className="text-green-500"
                                                    >
                                                        Done
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateStatus(item._id, "cancelled")}
                                                        className="text-red-500"
                                                    >
                                                        Cancelled
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={item.created_by.profilePicture}
                                                    alt={item.created_by.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span>{item.created_by?.name}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                                <ChevronUp className="h-4 w-4" />
                                                <span>{item.voteScore}</span>
                                            </Button>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">

                                                <MessageSquare className="h-4 w-4" />
                                                <span>1</span>
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="link" size="sm" className="text-primary" onClick={() => window.open(`/saran/board/${adviceGroup.link}/d/${item._id}`, "_blank")}>
                                                View <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                            <Button variant="link" size="sm" className="text-red-500" onClick={() => setDeleteId(item._id)}>
                                                Delete <Trash2 className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div >
            <DeletePopup
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={`Konfirmasi Menghapus ${advice.find(item => item._id === deleteId)?.title}`}
                description="Apakah Anda yakin ingin menghapus data ini? Semua komentar dan vote yang terkait juga akan dihapus."
                onConfirm={handleDeleteAdvice}
                onCancel={() => setDeleteId(null)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmClass="bg-red-500"
            />

            <DeletePopup
                open={!!deleteGroupId}
                onOpenChange={(open) => !open && setDeleteGroupId(null)}
                title={`Konfirmasi Menghapus ${adviceGroup?.name}`}
                description="Apakah Anda yakin ingin menghapus data ini? Semua saran yang terkait juga akan dihapus."
                onConfirm={handleDeleteGroup}
                onCancel={() => setDeleteGroupId(null)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmClass="bg-red-500"
            />
        </div >
    );
}

export default withAuth(AdviceGroupPage);
