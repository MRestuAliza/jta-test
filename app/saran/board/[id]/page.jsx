"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { ChevronRight,ChevronDown, ChevronUp, MessageSquare, ArrowRight, Trash2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import {
    Card,
    CardDescription,
    CardContent,
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
import { Textarea } from "@/components/ui/textarea"
import { useParams } from 'next/navigation'
import Swal from 'sweetalert2';
import Link from 'next/link';

function AdviceGroupPage() {
    const { id: groupSaranId } = useParams();
    const { status } = useSession();
    const [formWeb, setFormWeb] = useState({
        title: '',
        description: ''
    });
    const [advice, setAdvice] = useState([]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchAdvice();
        }
    }, [status]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormWeb({ ...formWeb, [name]: value });
    }

    const fetchAdvice = async () => {
        try {
            const response = await fetch(`/api/saran?link=${groupSaranId}`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data');

            }
            const data = await response.json();
            setAdvice(data.data)
        } catch (error) {
            console.error(error)

        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data yang dikirim:', {
            title: formWeb.title,
            description: formWeb.description
        });
        try {
            const response = await fetch(`/api/saran?link=${groupSaranId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formWeb)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Post created:', data);
                setFormWeb({
                    title: '',
                    description: ''
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Sukses',
                    text: 'Sukses Menambahkan Saran',
                    timer: 1000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                }).then(() => {
                    window.location.reload();
                });
            } else {
                const errorData = await response.json();
                console.log(`Error: ${errorData.message}`);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Gagal Mengupdate Data: ${errorData.message}`,
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error(error)
        }
    };
    const hasUpvoted = false;
    const hasDownvoted = false;

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departments"} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 ">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="sm:col-span-2">
                                <form className="grid gap-6" onSubmit={handleSubmit}>
                                    <CardHeader>
                                        <CardTitle>Masukkan Saran</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="title">Masukkan saran anda</Label>
                                                <Input
                                                    required
                                                    id="title"
                                                    name="title"
                                                    type="text"
                                                    value={formWeb.title}
                                                    onChange={handleInputChange}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="description">Silahkan jelaskan saran anda secara lebih rinci</Label>
                                                <Textarea
                                                    required
                                                    id="description"
                                                    name="description"
                                                    value={formWeb.description}
                                                    onChange={handleInputChange}
                                                    className="min-h-32"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" type="submit">Kirim saran</Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </div>
                    </div>
                    <div>
                        <div className="grid auto-rows-max items-start gap-4 md:gap-8 max-h-[900px] overflow-y-scroll">
                            {/* Repetisi untuk layout saran */}
                            {advice.map((item) => (
                                <Link href="www.google.com">
                                    <Card className="sm:col-span-2" key={item._id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="font-bold text-lg">{item.title}</CardTitle> {/* Judul */}
                                                    <CardDescription className="text-muted-foreground">{item.description}</CardDescription> {/* Deskripsi */}
                                                </div>
                                                {/* Bagian Upvote dan Downvote */}
                                                <div className="flex items-center text-black rounded-lg p-2">
                                                    <Button variant="ghost" onClick={""} className="p-1">
                                                        <ChevronUp className={`h-6 w-6 ${hasUpvoted ? 'text-blue-600' : ''}`} />
                                                    </Button>
                                                    <span>12</span>
                                                    <Button variant="ghost" onClick={""} className="p-1">
                                                        <ChevronDown className={`h-6 w-6 ${hasDownvoted ? 'text-red-600' : ''}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="flex justify-between items-center">
                                            {/* Bagian Komentar */}
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>12</span>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}

export default withAuth(AdviceGroupPage);