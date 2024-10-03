"use client"

import { useEffect, useState } from "react";
import Link from "next/link"
import {
    Mail,
    Users,
    ArrowUpRight,

} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Chart from "../../components/Dashboard/Chart"
import Sidebar from "@/components/General/Sidebar"
import Header from "@/components/General/Header"
import withAuth from "@/libs/withAuth"
import { useSession } from "next-auth/react";

export function Dashboard() {
    const { status } = useSession();
    const [totalAdvice, setTotalAdvice] = useState(0);
    const [newSaran, setNewSaran] = useState(0);
    const [currentDisplayed, setCurrentDisplayed] = useState(0);

    useEffect(() => {
        if (status === "authenticated") {
            fetchSaranCount()
        }
    }, [status]);


    const fetchSaranCount = async () => {
        try {
            const response = await fetch("/api/saran/count");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            const totalSaran = data.total;
            const totalAdviceLastMount = data.totalLastMonth;
            setTotalAdvice(totalSaran);
            setNewSaran(totalAdviceLastMount);
            animateCounter(0, totalSaran, setCurrentDisplayed);
            animateCounter(0, totalAdviceLastMount, setCurrentDisplayed);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    };

    const animateCounter = (start, end, setValue) => {
        const increment = Math.ceil((end - start) / 50);
        
        let current = start;

        const interval = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(interval);
            }
            setValue(current);
        }, 50);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <Header BreadcrumbLinkTitle={"Dashboard"} />
                <main className="p-4 space-y-4">

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                        <Card x-chunk="dashboard-01-chunk-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Saran</CardDescription>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentDisplayed}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{currentDisplayed} Dari Bulan Lalu
                                </p>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Super Admin</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +12 from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Admin</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +13 from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Students</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +100from last month
                                </p>
                            </CardContent>
                        </Card>
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        <Chart />
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Suggestions Summary</CardTitle>
                                    {/* <CardDescription>
                                        Recent transactions from your store.
                                    </CardDescription> */}
                                </div>
                                <Button asChild size="sm" className="ml-auto gap-1">
                                    <Link href="#">
                                        View All
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto max-h-64">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Customer</TableHead>
                                                <TableHead className="hidden xl:table-column">Name</TableHead>
                                                <TableHead className="hidden xl:table-column">Status</TableHead>
                                                <TableHead className="hidden xl:table-column">Date</TableHead>
                                                <TableHead className="text-right">Total Suggestions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Fakultas Teknik</TableCell>
                                                <TableCell className="hidden md:table-cell lg:hidden xl:table-column">2023-06-23</TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Fakultas Teknik</TableCell>
                                                <TableCell className="hidden md:table-cell lg:hidden xl:table-column">2023-06-23</TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Fakultas Teknik</TableCell>
                                                <TableCell className="hidden md:table-cell lg:hidden xl:table-column">2023-06-23</TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Fakultas Teknik</TableCell>
                                                <TableCell className="hidden md:table-cell lg:hidden xl:table-column">2023-06-23</TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>

                                </div>

                            </CardContent>
                        </Card>
                    </div>

                    {/* List all Advise */}
                    <div>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Suggestions</CardTitle>
                                    {/* <CardDescription>
                                        Recent transactions from your store.
                                    </CardDescription> */}
                                </div>
                                <Button asChild size="sm" className="ml-auto gap-1">
                                    <Link href="#">
                                        View All
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto max-h-80">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Customer</TableHead>
                                                <TableHead className="hidden sm:table-cell">
                                                    Type
                                                </TableHead>
                                                <TableHead className="hidden sm:table-cell">
                                                    Status
                                                </TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    Date
                                                </TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className="bg-accent">
                                                <TableCell>
                                                    <div className="font-medium">Liam Johnson</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        liam@example.com lkajsbfldkjbsaklbfkljasdbkljbdslk
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Sale
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        Fulfilled
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-23
                                                </TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Olivia Smith</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        olivia@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Refund
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="outline">
                                                        Declined
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-24
                                                </TableCell>
                                                <TableCell className="text-right">$150.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Noah Williams</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        noah@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Subscription
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        Fulfilled
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-25
                                                </TableCell>
                                                <TableCell className="text-right">$350.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Emma Brown</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        emma@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Sale
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        Fulfilled
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-26
                                                </TableCell>
                                                <TableCell className="text-right">$450.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Liam Johnson</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        liam@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Sale
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        Fulfilled
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-23
                                                </TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Liam Johnson</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        liam@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Sale
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        Fulfilled
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-23
                                                </TableCell>
                                                <TableCell className="text-right">$250.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Olivia Smith</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        olivia@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Refund
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="outline">
                                                        Declined
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-24
                                                </TableCell>
                                                <TableCell className="text-right">$150.00</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Emma Brown</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        emma@example.com
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    Sale
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        Fulfilled
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-26
                                                </TableCell>
                                                <TableCell className="text-right">$450.00</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>


                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default withAuth(Dashboard)