"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/General/Sidebar';
import Link from 'next/link';
import Header from "@/components/General/Header";
import { ChevronDown, ArrowRight, Trash2, ChevronUp, MessageSquare } from "lucide-react";
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
import withAuth from '@/libs/withAuth';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import NotFound from '@/app/not-found';


function AdviceGroupPage() {
    const { id } = useParams();
    const { status, data: session } = useSession();
    const [emailList, setEmailList] = useState([]);
    const [formWeb, setFormWeb] = useState({
        title: '',
        description: '',
        usserId: '',
        adminEmails: []
    });
    const [advicesGroup, setAdvicesGroup] = useState([]);
    const [advice, setAdvice] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [userVotes, setUserVotes] = useState({});
    const params = useParams();

    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (status === "authenticated") {
            fetchAdvice();
            fetchAdviceGroup();
            fetchEmailList()
        }
    }, [status]);

    useEffect(() => {
        if (advice.length > 0) {
            fetchUserVotes();
        }
    }, [advice]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormWeb({ ...formWeb, [name]: value });
    }

    const fetchAdviceGroup = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/group-saran?id=${params.id}`);
            if (!response.ok) {
                setNotFound(true);
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAdvicesGroup(data.data);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdvice = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/saran?link=${id}`);
            if (!response.ok) {
                throw new Error('Data tidak ditemukan');
            }
            const data = await response.json();
            console.log('Data advice:', data);

            if (!data || !data.data || data.data.length === 0) {
                setNotFound(true);
            } else {
                const adviceArray = Object.values(data.data);

                setAdvice(adviceArray);
                setNotFound(false);
            }
        } catch (error) {
            console.error(error);
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    };

    console.log('advice:', emailList);


    const fetchEmailList = async () => {
        try {
            const response = await fetch(`/api/getEmail?link=${id}`);
            if (response.ok) {
                const data = await response.json();
                setEmailList(data.data);
            } else {
                console.error('Failed to fetch email list');
            }
        } catch (error) {
            console.error('Error fetching email list:', error);
        }
    }

    const fetchUserVotes = async () => {
        try {
            const userId = session.user.id;
            const votesData = {};

            for (const item of advice) {
                const response = await fetch(`/api/saran/vote?saranId=${item._id}&userId=${userId}`);
                if (response.ok) {
                    const { userVote } = await response.json();
                    votesData[item._id] = userVote;
                } else if (response.status === 404) {
                    console.warn(`Data not found for saranId ${item._id}`);
                    votesData[item._id] = 0;  // Nilai default jika tidak ditemukan
                } else {
                    console.error("Failed to fetch vote status");
                }
            }
            setUserVotes(votesData);
        } catch (error) {
            console.error("Error fetching user votes:", error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = session.user.id;

        console.log('Form data yang dikirim:', {
            title: formWeb.title,
            description: formWeb.description,
            userId: userId,
            adminEmails: emailList
        });

        try {
            const response = await fetch(`/api/saran?link=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formWeb,
                    userId,
                    adminEmails: emailList
                })
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

    const handleVote = debounce(async (saranId, type) => {
        const voteType = type === 'upvote' ? 1 : -1;
        try {
            if (!session || !session.user || !session.user.id) {
                throw new Error('Anda harus login terlebih dahulu');
            }

            const userId = session.user.id;

            const response = await fetch(`/api/saran/vote`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ saranId, userId, voteType })
            });

            if (response.ok) {
                const { success, voteScore, userVote } = await response.json();

                if (success && typeof voteScore !== 'undefined') {
                    setAdvice(prev =>
                        prev.map(item =>
                            item._id === saranId ? { ...item, voteScore } : item
                        )
                    );
                    setUserVotes(prev => ({
                        ...prev,
                        [saranId]: userVote
                    }));
                } else {
                    console.error("Invalid response data");
                }
            } else {
                console.error('Failed to update vote');
            }
        } catch (error) {
            console.error('Error while voting:', error);
        }
    }, 500);


    console.log("asd",advice);
    


    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }


    if (notFound) {
        return (
            <><NotFound /></>
        );
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
                                <form className="grid gap-6" onSubmit={handleSubmit}>
                                    <CardHeader>
                                        <CardTitle>Masukkan Saran untuk {advicesGroup.name}</CardTitle>
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
                            {advice.map((item) => (
                                <Card className="sm:col-span-2" key={item._id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="font-bold text-lg">{item.title}</CardTitle>

                                                <CardDescription className="text-muted-foreground">{item.description}</CardDescription>
                                            </div>
                                            <div className="flex items-center text-black rounded-lg p-2">
                                                <Button
                                                    variant="ghost"
                                                    className="p-1"
                                                    onClick={() => handleVote(item._id, 'upvote')}
                                                >
                                                    <ChevronUp
                                                        className={`h-6 w-6 ${userVotes[item._id] === 1 ? ' bg-[#10172A] rounded-sm text-white' : ''
                                                            }`}
                                                    />
                                                </Button>
                                                <span>{item.voteScore}</span>
                                                <Button
                                                    variant="ghost"
                                                    className="p-1"
                                                    onClick={() => handleVote(item._id, 'downvote')}
                                                >
                                                    <ChevronDown
                                                        className={`h-6 w-6 ${userVotes[item._id] === -1 ? 'bg-[#10172A] rounded-sm text-white' : ''
                                                            }`}
                                                    />
                                                </Button>
                                            </div>

                                        </div>
                                    </CardHeader>
                                    <CardFooter className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <span>{item.created_by}</span>
                                            </div>
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{item.comments}</span>
                                        </div>

                                        <div className="flex text-primary items-center gap-2">
                                            <span className={`${item.status === "new" ? "text-gray-500" : ""} ${item.status === "work in progress" ? "text-blue-400" : ""} ${item.status === "completed" ? "text-green-500" : ""} ${item.status === "cancelled" ? "text-red-500" : ""}`}>
                                                {item.status}
                                            </span>

                                            <Link
                                                href={`/saran/board/${item.link}/d/${item._id}`}
                                                target="_blank"
                                                className="text-primary inline-flex items-center hover:underline"
                                            >
                                                View <ArrowRight className="ml-1 h-4 w-4" />
                                            </Link>
                                        </div>
                                    </CardFooter>
                                </Card>

                            ))}
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}

export default withAuth(AdviceGroupPage);
