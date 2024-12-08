"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ListFilter, MoreHorizontal, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/General/Sidebar";
import Header from "@/components/General/Header";
import { useSession } from "next-auth/react";
import withAuth from "@/libs/withAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/libs/dateUtils";
import Swal from "sweetalert2";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function Page() {
  const { status, data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === "authenticated") {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers(currentPage, activeTab);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [status, session, currentPage, searchQuery, activeTab]);


  const fetchUsers = async (page, filter = 'all') => {
    setIsLoading(true);
    try {
      if (session?.user?.role) {
        const response = await fetch(
          `/api/auth/users?page=${page}&limit=${itemsPerPage}&filter=${filter}&search=${searchQuery}`, {
          headers: {
            "X-User-Role": session.user.role,
            "X-User-Department-Id": session.user.departementId || '',
            "X-User-Department-Type": session.user.departmentType || ''
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.data);
        setTotalItems(data.total);
        setTotalPages(Math.ceil(data.total / data.limit));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "Admin") {
      return user.role.includes("Admin") && user.role !== "Super Admin";
    } else {
      return user.role.includes(roleFilter);
    }
  });

  const handleDialogOpen = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/auth/users?userId=${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "User deleted successfully",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to delete user",
          text: "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while deleting the user.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const LoadingOverlay = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-md bg-background p-4 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading users...</span>
      </div>
    </div>
  );

  const CustomPagination = () => {
    const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    };

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      const halfVisible = Math.floor(maxVisiblePages / 2);

      let startPage = Math.max(currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }

      if (startPage > 1) {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink
              onClick={() => handlePageChange(1)}
              isActive={currentPage === 1}
            >
              1
            </PaginationLink>
          </PaginationItem>
        );
        if (startPage > 2) {
          pages.push(
            <PaginationItem key="start-ellipsis">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(
            <PaginationItem key="end-ellipsis">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }

      return pages;
    };

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isLoading ? "pointer-events-none" : ""}`}
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isLoading ? "pointer-events-none" : ""}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header BreadcrumbLinkTitle={"User"} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <TabsContent value="all">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>List Users</CardTitle>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full sm:w-[300px] pl-8 pr-4"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10">
                          <ListFilter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setActiveTab("all")}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveTab("admin")}>
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveTab("mahasiswa")}>
                          Mahasiswa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading && <LoadingOverlay />}
                  <div className={`transition-all duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Nim
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Email
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Created at
                          </TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="hidden sm:table-cell">
                              {user.profilePicture ? (
                                <Image
                                  className="h-10 w-10 rounded-full"
                                  width={500}
                                  height={500}
                                  src={user.profilePicture}
                                  alt="Avatar"
                                />
                              ) : (
                                <svg
                                  className="w-10 h-10 text-gray-800 dark:text-white"
                                  ariaHidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                  />
                                </svg>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.nim ? user.nim : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.email}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleDialogOpen(user)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDeleteId(user._id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <CustomPagination />

                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground mt-4">
                    Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> users
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <DialogDemo
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        user={selectedUser}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Konfirmasi Menghapus{" "}
              {users.find((user) => user._id === deleteId)?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data ini? Semua data terkait
              akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

export default withAuth(Page);


function DialogDemo({ isOpen, onClose, user }) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "");
  const [departments, setDepartments] = useState([]);
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchDepartments();
    }
  }, [status]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched departments:", data);
        setDepartments(data.data);
      } else {
        throw new Error("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  }

  const handleSave = async () => {
    try {
      const updateData = {
        newRole: selectedRole
      };

      if (selectedRole.startsWith('Admin')) {
        const departmentName = selectedRole.replace('Admin ', '');
        const department = departments.find(d => d.name === departmentName);

        if (!department) {
          throw new Error("Department not found for selected role");
        }

        updateData.departementId = department._id;
        updateData.departmentType = department.type;
      } else {
        // For non-admin roles, exclude departmentId and departmentType from update
        updateData.departementId = null;
        updateData.departmentType = null;
      }

      const response = await fetch(`/api/auth/users?userId=${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": session.user.role,
          "X-User-Department-Id": session.user.departementId || '',
          "X-User-Department-Type": session.user.departmentType || ''
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Sukses',
          text: 'Sukses Mengubah Data',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          onClose();
          window.location.reload();
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred while updating the role.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Buat perubahan pada profil user di sini. Klik simpan setelah Anda selesai
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue={user?.name || ""}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Pilih Role
            </Label>
            <Select
              onValueChange={setSelectedRole}
              value={selectedRole}
              disabled={!session?.user?.role.includes('Admin')}
            >
              <SelectTrigger
                id="role"
                aria-label="Select role"
                className="w-full h-full col-span-3"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {session?.user?.role === 'Super Admin' ? (
                  <>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                    {departments.map((department) => {
                      return (
                        <SelectItem
                          key={department._id}
                          value={`Admin ${department.name}`}
                        >
                          Admin {department.name}
                        </SelectItem>
                      );
                    })}
                  </>
                ) : (
                  <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
          >
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}