"use client"

import React, { useEffect, useState } from "react";
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import withAuth from "@/libs/withAuth";
import Swal from 'sweetalert2';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from "next-auth/react";

function EditPage() {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedStudyProgram, setSelectedStudyProgram] = useState('');
  const [isDataExist, setIsDataExist] = useState(null);
  const [isFacultyFormActive, setIsFacultyFormActive] = useState(false);
  const [isProgramDataExist, setIsProgramDataExist] = useState(null);
  const [formWeb, setFormWebData] = useState({
    name: '',
    link: '',
    type: "",
    fakultas_id: "",
    prodi_id: "",
    university_id: process.env.NEXT_PUBLIC_UNIVERSITY_ID
  });

  const [facultyData, setFacultyData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const { status } = useSession();
  const { id } = useParams();  // Ambil ID dari URL
  const router = useRouter(); // Gunakan router untuk navigasi setelah edit berhasil

  useEffect(() => {
    if (status === "authenticated") {
      fetchFaculty();
      fetchWebData(); // Fetch data awal untuk diedit
    }
  }, [status]);

  // Fetch data yang akan di-edit
  const fetchWebData = async () => {
    try {
      const response = await fetch(`/api/website/${id}`);  // Fetch berdasarkan ID dari URL

      if (response.ok) {
        const data = await response.json();
        setFormWebData(data);  // Isi form dengan data yang di-fetch
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormWebData({ ...formWeb, [name]: value });
  };

  const handleSelectChange = (value) => {
    setSelectedOption(value);
    setSelectedFaculty('');
    setSelectedStudyProgram('');
    setIsDataExist(null);
    setIsFacultyFormActive(false);
    setIsProgramDataExist(null);
    setFormWebData((prevData) => ({ ...prevData, type: value }));
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch("/api/departments/fakultas");

      if (response.ok) {
        const data = await response.json();
        setFacultyData(data.data);
      } else {
        console.error('Failed to fetch faculties');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/website/${id}`, {
        method: 'PUT',  // Gunakan metode PUT untuk edit data
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formWeb)
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Sukses',
          text: 'Data berhasil di-update',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        router.push('/departements'); // Redirect ke halaman lain setelah berhasil update
      } else {
        console.error('Failed to update data');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Edit Departments"} />
        <main className='p-4 space-y-4'>
          <form className="grid gap-6" onSubmit={handleSubmit}>

            {/* Form */}
            <div className="grid gap-3">
              <Label htmlFor="level">Pilih Tingkat</Label>
              <Select onValueChange={handleSelectChange} value={formWeb.type}>
                <SelectTrigger id="level" aria-label="Select level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Universitas">Universitas</SelectItem>
                  <SelectItem value="Fakultas">Fakultas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama Website</Label>
                <Input id="name" name="name" value={formWeb.name} onChange={handleInputChange} required placeholder="Masukkan nama website" />
              </div>
              <div>
                <Label htmlFor="link">Link Website</Label>
                <Input id="link" name="link" value={formWeb.link} onChange={handleInputChange} required placeholder="Masukkan link website" />
              </div>
            </div>

            {/* Tombol */}
            <div className="flex pt-4 flex-col mx-auto gap-4">
              <Button className="w-96">Update</Button>
              <Button variant="outline" className="w-96" onClick={() => router.push('/departements')}>Cancel</Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default withAuth(EditPage);
