"use client"

import { useEffect, useState, useMemo } from "react";
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
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

export function Saran() {
    const { status, data: session } = useSession();
    const [adviceUser, setAdviceUser] = useState([]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchAdviceUser()
        }
    }, [status]);

    console.log("adviceUser", adviceUser.length);


    const fetchAdviceUser = async () => {
        try {
            const res = await fetch(`/api/saran?userId=${session?.user?.id}`);

            if (res.ok) {
                const data = await res.json();

                setAdviceUser(data.data);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error("Error fetching latest suggestions:", error);
            return new Response(JSON.stringify({
                success: false,
                message: "Gagal mengambil saran terbaru",
                error: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <Header BreadcrumbLinkTitle={"Dashboard"} />
                <main className="p-4">
                    <div>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Saran</CardTitle>
                                    <CardDescription>
                                        Saran sudah dibuat
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
                                                <TableHead className="hidden md:table-cell">
                                                    Tanggal
                                                </TableHead>
                                                <TableHead className="text-right"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {adviceUser.length > 0 ? (
                                                adviceUser.map((advice) => (
                                                    <TableRow className="">
                                                        <TableCell key={advice.id}>
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
                                                        <TableCell className="hidden md:table-cell">
                                                            {formatDate(advice.created_at)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button>
                                                                <Link href={`/mahasiswa/saran/board/${advice.link}`}>Buka</Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center">
                                                        <div className="text-muted-foreground">Tidak ada saran yang dibuat</div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
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

export default withAuth(Saran)