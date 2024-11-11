"use client"

import { useEffect, useState, useMemo } from "react";
import Link from "next/link"
import {
    Mail,
    Users,
    ArrowUpRight,

} from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
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
import { formatDate } from "@/libs/dateUtils";
import Sidebar from "@/components/General/Sidebar"
import Header from "@/components/General/Header"
import withAuth from "@/libs/withAuth"
import { useSession } from "next-auth/react";
import { Label, Pie, PieChart } from "recharts"

export function Dashboard() {
    const { status } = useSession();
    const [currentDisplayed, setCurrentDisplayed] = useState(0);
    const [saranList, setSaranList] = useState([]);
    const [userCount, setUserCount] = useState({ admin: 0, superAdmin: 0, mahasiswa: 0 });
    const [lastAdvice, setLastAdvice] = useState([]);
    const [totalStatus, setTotalStatus] = useState({
        new: 0,
        'work in progress': 0,
        completed: 0,
        cancelled: 0,
    });
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            loadData();
        }
    }, [status]);

    const loadData = async () => {
        fetchSaranCount()
        fetchSaranListCount()
        fetchLastAdvice()
        fetchRoleCount()
        setIsPageLoading(false);
    }

    const fetchSaranCount = async () => {
        try {
            const response = await fetch("/api/saran/count");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const totalSaran = data.total;
            setTotalStatus(data.statusCounts);
            animateCounter(currentDisplayed, totalSaran, setCurrentDisplayed);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    };


    const fetchSaranListCount = async () => {
        try {
            const response = await fetch("/api/dashboard/suggestions-summary");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const formattedData = Object.entries(data.data).map(([key, value]) => ({
                institution: key,
                totalSuggestions: `${value.toFixed(0)}`
            }));
            setSaranList(formattedData);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    }

    const fetchLastAdvice = async () => {
        try {
            const response = await fetch("/api/dashboard/last-advice");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setLastAdvice(data.data);
        } catch (error) {
            console.error('Failed to fetch advice:', error);
        }
    }

    const fetchRoleCount = async () => {
        try {
            const response = await fetch("/api/dashboard/user-count");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            animateCounter(userCount.admin, data.data.admin, (value) =>
                setUserCount((prev) => ({ ...prev, admin: value }))
            );

            animateCounter(userCount.superAdmin, data.data.superAdmin, (value) =>
                setUserCount((prev) => ({ ...prev, superAdmin: value }))
            );

            animateCounter(userCount.mahasiswa, data.data.mahasiswa, (value) =>
                setUserCount((prev) => ({ ...prev, mahasiswa: value }))
            );

        } catch (error) {
            console.error('Failed to fetch role count:', error);
        }
    }

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

    const chartData = useMemo(() => [
        { status: "In Progress", visitors: totalStatus["work in progress"], fill: "var(--color-progress)" },
        { status: "New", visitors: totalStatus["new"], fill: "var(--color-new)" },
        { status: "Cancelled", visitors: totalStatus["cancelled"], fill: "var(--color-cancelled)" },
        { status: "Completed", visitors: totalStatus["completed"], fill: "var(--color-done)" },
    ], [totalStatus]);

    const chartConfig = {
        visitors: {
            label: "Visitors",
        },
        progress: {
            label: "In Progress",
            color: "#63b2fd",
        },
        new: {
            label: "New",
            color: "#9bdfc4",
        },
        cancelled: {
            label: "Cancelled",
            color: "#f99cab",
        },
        done: {
            label: "Done",
            color: "#ffb44f",
        },
    }

    if (isPageLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

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
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Super Admin</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userCount.superAdmin}</div>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Admin</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userCount.admin}</div>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>Total Mahasiswa</CardDescription>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userCount.mahasiswa}</div>
                            </CardContent>
                        </Card>
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        <Card className="flex flex-col">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Feedback Analytics</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={chartData}
                                            dataKey="visitors"
                                            nameKey="status"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                            >
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {currentDisplayed}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-muted-foreground"
                                                                >
                                                                    Saran
                                                                </tspan>
                                                            </text>
                                                        )
                                                    }
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Total Saran</CardTitle>
                                    <CardDescription>
                                        Total saran setiap institusi
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto max-h-64">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Institution</TableHead>
                                                <TableHead className="hidden xl:table-column">Name</TableHead>
                                                {/* <TableHead className="hidden xl:table-column">Status</TableHead>
                                                <TableHead className="hidden xl:table-column">Date</TableHead> */}
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {saranList.map((saran, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{saran.institution}</TableCell>
                                                    <TableCell className="hidden md:table-cell lg:hidden xl:table-column">-</TableCell>
                                                    <TableCell className="text-right">{saran.totalSuggestions}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </div>

                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Saran</CardTitle>
                                    <CardDescription>
                                        Saran terbaru yang masuk
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto max-h-80">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Saran</TableHead>
                                                <TableHead className="hidden sm:table-cell">
                                                    Saran Untuk
                                                </TableHead>
                                                <TableHead className="hidden sm:table-cell">
                                                    Status
                                                </TableHead>
                                                <TableHead className="">Dibuat Oleh</TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    Tanggal
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lastAdvice.map((advice) => (
                                                <TableRow className="">
                                                    <TableCell key={advice._id}>
                                                        <div className="font-medium">{advice.title}</div>
                                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                                            {advice.description}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        {advice.group_name}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Badge className="text-xs" variant="secondary">
                                                            {advice.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="">{advice.created_by}</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {formatDate(advice.created_at)}
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
        </div>
    )
}

export default withAuth(Dashboard)