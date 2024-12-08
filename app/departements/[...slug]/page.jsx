"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/General/Sidebar";
import Header from "@/components/General/Header";
import { ArrowUpRight, Search, MoreVertical, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import withAuth from "@/libs/withAuth";
import { formatDate } from "@/libs/dateUtils";
import { Label } from "@/components/ui/label";
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
import Swal from "sweetalert2";

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedFakultasId, setSelectedFakultasId] = useState(null);
  const { status, data: session } = useSession();
  const params = useParams();
  const slug = params.slug || [];
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [facultyData, setFacultyData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;


  useEffect(() => {
    if (status === "authenticated") {
      fetchDepartments(currentPage);
      fetchFaculty();
    }
  }, [status, slug, currentPage]);

  const fetchDepartments = async (page) => {
    setIsLoading(true);
    try {
      let response;
      let combinedData = [];
      if (session?.user?.role.startsWith('Admin')) {
        response = await fetch(
          `/api/institusi?id=${slug[0]}&role=${session?.user?.role}&page=${page}&limit=${itemsPerPage}`
        );
        const data = await response.json();
        if (session?.user?.type === "Prodi") {
          combinedData = data.data.prodi_websites || [];
        } else {
          combinedData = [
            ...(data.data.fakultas_websites || []),
            ...(data.data.prodi_list || []),
          ];
        }
        setTotalItems(data.total);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } else {
        if (slug.length === 1) {
          response = await fetch(
            `/api/institusi?id=${slug[0]}&page=${page}&limit=${itemsPerPage}`
          );
        } else if (slug.length === 2) {
          response = await fetch(
            `/api/institusi?id=${slug[1]}&page=${page}&limit=${itemsPerPage}`
          );
        } else {
          console.error("Unexpected slug length");
          return;
        }
        const data = await response.json();
        if (slug.length === 1 && data.success) {
          combinedData = [
            ...(data.data.fakultas_websites || []),
            ...(data.data.prodi_list || []),
          ];
        } else if (slug.length === 2 && data.success) {
          combinedData = [
            ...(data.data.prodi_websites || []),
          ];
        }
        setTotalItems(data.total);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      }
      setDepartments(combinedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch(
        `/api/institusi?id=${process.env.NEXT_PUBLIC_UNIVERSITY_ID}`
      );
      if (response.ok) {
        const data = await response.json();
        setFacultyData({ fakultas_list: data.data.fakultas_list || [] });
      } else {
        console.error("Failed to fetch faculties");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleProdiSelectChange = (fakultasId) => {
    setSelectedFakultasId(fakultasId);
  };

  const LoadingOverlay = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-md bg-background p-4 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading data...</span>
      </div>
    </div>
  );

  const deleteDepartment = async (id) => {
    try {
      const response = await fetch(`/api/institusi?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDepartments((prevDepartments) => {

          const updatedDepartments = prevDepartments
            ? [...prevDepartments]
            : [];

          const filteredDepartments = updatedDepartments.filter(
            (department) => department._id !== id
          );
          return filteredDepartments;
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: `Gagal menghapus data: ${errorData.message}`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Terjadi kesalahan saat menghapus data: ${error.message}`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const updateDepartment = async (id) => {
    try {
      const department = departments.find((dept) => dept._id === id);
      console.log("update", department);
      let response;

      if (department && department.type) {
        let updatedData = {
          name: department.name,
        };
        if (department.type === "Prodi") {
          const universityId = process.env.NEXT_PUBLIC_UNIVERSITY_ID;

          const fakultasId =
            selectedFakultasId ||
            (Array.isArray(department.ref_ids) && department.ref_ids.length > 1
              ? department.ref_ids[1]
              : null);
          if (fakultasId) {
            updatedData.ref_ids = [universityId, fakultasId];
          } else {
            updatedData.ref_ids = department.ref_ids;
          }
        }

        if (
          department.type === "Universitas" ||
          department.type === "Fakultas"
        ) {
          updatedData.link = department.link;
          response = await fetch(`/api/website?id=${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          });
        } else if (department.type === "Prodi") {
          if (department.link) {
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
        }
      }

      if (response.ok) {
        const updatedDepartment = await response.json();
        setDepartments(
          departments.map((department) =>
            department._id === id ? updatedDepartment.data : department
          )
        );
        Swal.fire({
          icon: "success",
          title: "Sukses",
          text: "Sukses Mengupdate Data",
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
          title: "Error",
          text: `Gagal Mengupdate Data: ${errorData.message}`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Gagal Mengupdate Data: ${error.message}`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteDepartment(deleteId);
      setDeleteId(null);
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
    setDepartments((prevDepartments) =>
      prevDepartments.map((department) =>
        department._id === editId
          ? { ...department, [field]: value }
          : department
      )
    );
  };

  const CustomPagination = () => {
    const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    };

    return (
      <div className="">
        <div className="flex items-center justify-between">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isLoading ? "pointer-events-none" : ""}`}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} ${isLoading ? "pointer-events-none" : ""}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header BreadcrumbLinkTitle={"Departments"} />
        <main className="p-4 space-y-4">
          <div>
            <Card x-chunk="dashboard-05-chunk-2">
              <CardHeader className="">
                <div className="grid gap-2">
                  <CardTitle className="">List Departemen</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading && <LoadingOverlay />}
                <div className={`transition-all duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
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
                        {departments.length > 0 ? (
                          departments.map((department) => (
                            <TableRow key={department._id || department.id}>
                              <TableCell>
                                <div className="font-medium">{department.name}</div>
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
                                          href={`/departements/${slug[0]}/${department._id || department.id}`}
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
                                        setDeleteId(department._id || department.id)
                                      }
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
                  <CustomPagination />
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground mt-4">
                  Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> users
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Konfirmasi Menghapus{" "}
              {
                departments.find((department) => department._id === deleteId)
                  ?.name
              }
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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!editId}
        onOpenChange={(open) => !open && setEditId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Konfirmasi Mengedit{" "}
              {
                departments.find((department) => department._id === editId)
                  ?.name
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="grid gap-3 ">
              {(() => {
                const department = departments.find(
                  (dept) => dept._id === editId
                );
                console.log("department", department);

                if (!department) return null;

                // Jika tidak ada link, tampilkan form default untuk mengedit nama
                if (!department.link) {
                  // Logika jika type adalah Fakultas
                  if (department.type === "Fakultas") {
                    return (
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Fakultas</Label>
                        <Input
                          id="name"
                          name="name"
                          value={
                            departments.find(
                              (department) => department._id === editId
                            )?.name || ""
                          }
                          onChange={(e) => handleInputChange(e, "name")}
                          required
                          placeholder="Masukkan nama fakultas"
                          className="w-full"
                        />
                      </div>
                    );
                  }
                  // Logika jika type adalah Prodi
                  else if (department.type === "Prodi") {
                    return (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Prodi</Label>
                          <Input
                            id="name"
                            name="name"
                            value={
                              departments.find(
                                (department) => department._id === editId
                              )?.name || ""
                            }
                            onChange={(e) => handleInputChange(e, "name")}
                            required
                            placeholder="Masukkan nama prodi"
                            className="w-full"
                          />
                        </div>

                        {/* Tambahkan Select untuk memilih level Universitas atau Fakultas */}
                        <div className="space-y-2">
                          <Label htmlFor="level">Pilih Level</Label>
                          <Select onValueChange={handleProdiSelectChange}>
                            <SelectTrigger
                              id="study-program"
                              aria-label="Pilih level"
                            >
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              {facultyData.fakultas_list?.length > 0 ? (
                                facultyData.fakultas_list.map((fakultas) => (
                                  <SelectItem
                                    key={fakultas.id}
                                    value={fakultas.id}
                                  >
                                    {fakultas.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled>
                                  Tidak ada fakultas
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    );
                  }
                }
                switch (department.type) {
                  case "Universitas":
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
                  case "Fakultas":
                    return (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Website Fakultas</Label>
                          <Input
                            id="name"
                            name="name"
                            value={department.name || ""}
                            onChange={(e) => handleInputChange(e, "name")}
                            required
                            placeholder="Masukkan nama fakultas"
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
                  case "Prodi":
                    return (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Website Prodi</Label>
                          <Input
                            id="name"
                            name="name"
                            value={department.name || ""}
                            onChange={(e) => handleInputChange(e, "name")}
                            required
                            placeholder="Masukkan nama website prodi"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link">Link Website Prodi</Label>
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
                  default:
                    return (
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Fakultas</Label>
                        <Input
                          id="name"
                          name="name"
                          value={
                            departments.find(
                              (department) => department._id === editId
                            )?.name || ""
                          }
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
