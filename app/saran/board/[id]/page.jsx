"use client";

import React from 'react';
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { ChevronRight, ChevronUp, MessageSquare, ArrowRight, Trash2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
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

function AdviceGroupPage() {

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departments"} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 ">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="sm:col-span-2">
                                <CardHeader>
                                    <CardTitle>Product Details</CardTitle>
                                    <CardDescription>
                                        Lipsum dolor sit amet, consectetur adipiscing elit
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Masukkan saran anda</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Silahkan jelaskan saran anda secara lebih rinci</Label>
                                            <Textarea
                                                id="description"
                                                className="min-h-32"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Kirim saran</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                    <div>
                        <div className="grid auto-rows-max items-start gap-4 md:gap-8 max-h-[900px] overflow-y-scroll">
                            {/* Repetisi untuk layout saran */}
                            <Card className="sm:col-span-2">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-semibold">Saran Title</CardTitle>
                                            <CardDescription className="text-muted-foreground">Saran description</CardDescription>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="text-muted-foreground">
                                                    <span role="img" aria-label="flag">⭐</span> New <ChevronRight className="inline h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>
                                                    <span role="img" aria-label="star">⭐</span> New
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <span role="img" aria-label="flag">🏗️</span> Work In Progress
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <span role="img" aria-label="check">✅</span> Shipped
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <span role="img" aria-label="cross">❌</span> Cancelled
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                    </div>
                                </CardHeader>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                            <ChevronUp className="h-4 w-4" />
                                            <span>0</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>1</span>
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="link" size="sm" className="text-primary">
                                            View <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                        <Button variant="link" size="sm" className="text-red-500">
                                            Delete <Trash2 className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}

export default withAuth(AdviceGroupPage);
