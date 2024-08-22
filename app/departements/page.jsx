import React from 'react'
import Link from "next/link"
import Sidebar from '@/components/General/Sidebar'
import Header from "@/components/General/Header"
import { ArrowUpRight, Search, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function page() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
                <Header BreadcrumbLinkTitle={"Departements"} />
                <main className='p-4 space-y-4'>
                    <div>
                        <Card x-chunk="dashboard-05-chunk-2">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle className="">List Departemenent</CardTitle>
                                    {/* <CardDescription>
                                        Recent transactions from your store.
                                    </CardDescription> */}
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
                                            {/* <TableRow className="bg-accent">
                                                <TableCell>
                                                    <div className="font-medium">Sistem Akdemik</div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    wwww.sia.com
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        University
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-23
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
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem>Export</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Trash</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>



 */}

                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Sistem Akdemik</div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    wwww.sia.com
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        University
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-23
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
                                                            <DropdownMenuItem>Open</DropdownMenuItem>
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <div className="font-medium">Sistem Akdemik</div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    wwww.sia.com
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge className="text-xs" variant="secondary">
                                                        University
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    2023-06-23
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
                                                            <DropdownMenuItem>Open</DropdownMenuItem>
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
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
