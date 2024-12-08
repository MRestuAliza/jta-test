"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/General/Sidebar";
import Header from "@/components/General/Header";
import { MoreVertical, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Swal from "sweetalert2";
import { Label } from "@/components/ui/label";
import withAuth from "@/libs/withAuth";
import { formatDate } from "@/libs/dateUtils";

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const { status, data: session } = useSession();
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDepartments(currentPage);
    }
  }, [status, currentPage]);

  const fetchDepartments = async (page) => {
    setIsLoading(true);
    try {
      let response;
      let combinedData = [];
      if (session?.user?.role.startsWith("Admin")) {
        response = await fetch(
          `/api/institusi?id=${session?.user?.departementId}&role=${session?.user?.role}&page=${page}&limit=10`
        );
        
        const data = await response.json();
        if (session?.user?.departmentType === "Prodi") {
          combinedData = data.data.prodi_websites || [];
          console.log("response", response);
        } else {
          combinedData = [
            ...(data.data.fakultas_websites || []),
            ...(data.data.prodi_list || []),
          ];
        }
        setTotalPages(Math.ceil(data.total / 10));
      } else {
        response = await fetch(
          `/api/institusi?id=${process.env.NEXT_PUBLIC_UNIVERSITY_ID}&page=${page}&limit=10`
        );
        const data = await response.json();
        combinedData = [
          ...(data.data.university_websites || []),
          ...(data.data.fakultas_list || []),
        ];
        setTotalPages(Math.ceil(data.total / 10));
      }
      setDepartments(combinedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    const previousDepartments = [...departments];

    try {
      setDepartments(departments.filter(
        (department) => department._id !== id && department.id !== id
      ));

      const response = await fetch(`/api/institusi?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {

        setDepartments(previousDepartments);
        throw new Error(data.message || 'Failed to delete');
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil dihapus.',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });

    } catch (error) {

      setDepartments(previousDepartments);
      console.error("Error deleting department:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Gagal menghapus data.',
        showConfirmButton: true
      });
    }
  };

  const updateDepartment = async (id) => {
    try {
      const department = departments.find(
        (dept) => dept._id === id || dept.id === id
      );
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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
      } else {
        response = await fetch(`/api/institusi?id=${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
      }

      if (response.ok) {
        const updatedDepartment = await response.json();
        setDepartments((prevDepartments) => {
          return prevDepartments.map((department) =>
            department._id === id || department.id === id
              ? updatedDepartment.data
              : department
          );
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Data gagal di update.",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      setIsDeleting(true);
      try {
        await deleteDepartment(deleteId);
      } finally {
        setIsDeleting(false);
        setDeleteId(null);
      }
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
    setDepartments((prevDepartments) => {
      const updatedDepartments = prevDepartments.map((department) => {
        if (department._id === editId || department.id === editId) {
          return { ...department, [field]: value };
        }
        return department;
      });
      return updatedDepartments;
    });
  };

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
      <div className="flex items-center gap-2 bg-background p-4 rounded-md shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading data...</span>
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
            <PaginationLink onClick={() => handlePageChange(1)}>
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
            <PaginationLink onClick={() => handlePageChange(totalPages)}>
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
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={`${currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
                } ${isLoading ? "pointer-events-none" : ""}`}
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              className={`${currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
                } ${isLoading ? "pointer-events-none" : ""}`}
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
        <Header />
        <main className="p-4 space-y-4">
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle className="">List Departemen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="relative">
                  <div className={`transition-all duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
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
                                  <div className="font-medium">
                                    {department.name}
                                  </div>
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
                                            href={`/departements/${department._id || department.id
                                              }`}
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
                                          setDeleteId(
                                            department._id || department.id
                                          )
                                        }
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <CustomPagination />
                  </div>
                  {isLoading && <LoadingOverlay />}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Konfirmasi Menghapus{" "}
              {deleteId &&
                (departments.find(
                  (dept) => dept._id === editId || dept.id === editId
                )?.name ||
                  "")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data ini? Semua data program
              studi, saran, dan website yang terkait juga akan dihapus
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Update */}
      <AlertDialog
        open={!!editId}
        onOpenChange={(open) => !open && setEditId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Konfirmasi Mengedit{" "}
              {editId &&
                (departments.find(
                  (dept) => dept._id === editId || dept.id === editId
                )?.name ||
                  "")}
            </AlertDialogTitle>
            <AlertDialogDescription className="grid gap-3">
              {(() => {
                const department =
                  editId &&
                  departments.find(
                    (dept) => dept._id === editId || dept.id === editId
                  );
                if (!department) return null;
                if (department.link_advice) {
                  return (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Website</Label>
                        <Input
                          id="name"
                          name="name"
                          value={department.name || ""}
                          onChange={(e) => handleInputChange(e, "name")}
                          required
                          placeholder="Masukkan nama website"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Link Website</Label>
                        <Input
                          id="link"
                          name="link"
                          value={department.link || ""}
                          onChange={(e) => handleInputChange(e, "link")}
                          required
                          placeholder="Masukkan link website"
                        />
                      </div>
                    </>
                  );
                } else {
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Fakultas</Label>
                      <Input
                        id="name"
                        name="name"
                        value={department.name || ""}
                        onChange={(e) => handleInputChange(e, "name")}
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
            <AlertDialogCancel onClick={() => setEditId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate}>Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAuth(DepartmentPage);
