"use client"

import React, { useEffect, useState } from "react";
import Sidebar from '@/components/General/Sidebar'
import Header from "@/components/General/Header"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import withAuth from "@/libs/withAuth";
import Swal from 'sweetalert2';
import { useSession } from "next-auth/react";

function Page() {
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

  console.log('Form Data:', formWeb);

  const [facultyData, setFacultyData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const { status } = useSession();
  const [addWebsiteOrSelectProgram, setAddWebsiteOrSelectProgram] = useState('');

  useEffect(() => {
    if (status === "authenticated") {
      fetchFaculty();
    }
  }, [status]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormWebData({ ...formWeb, [name]: value });
  }

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
      const response = await fetch("/api/departments/fakultas")

      if (response.ok) {
        const data = await response.json()
        console.log(data);

        setFacultyData(data.data)
      } else {
        console.error('Failed to fetch faculties');
      }

    } catch (error) {
      console.error(error);
    }
  }

  // Handle faculty selection
  const handleFacultySelectChange = (value) => {
    setSelectedFaculty(value);
    setFormWebData((prevData) => ({
      ...prevData,
      fakultas_id: value
    }));
    fetchProdi(value);
    setIsProgramDataExist(null); // Reset program data existence
  };

  // Handle data existence check for faculty
  const handleDataExistChange = (value) => {
    const exists = value === 'Yes';
    setIsDataExist(exists);
    if (!exists) {
      setIsFacultyFormActive(true); // Show faculty form if data does not exist
    } else {
      setIsFacultyFormActive(false); // Hide faculty form if data exists
    }

    setIsProgramDataExist(null); // Reset program data existence
    setSelectedStudyProgram(''); // Reset selected study program
  };

  // Handle program data existence check
  const handleProgramDataExistChange = (value) => {
    const exists = value === 'Yes';
    setIsProgramDataExist(exists);
  };

  const handleAddWebsiteOrSelectProgramChange = (value) => {
    setAddWebsiteOrSelectProgram(value);
    console.log("handle Add", value);

    if (value === 'selectProgram') {
      setFormWebData((prevData) => ({
        ...prevData,
        type: 'Prodi'
      }));
    }
  };

  const fetchProdi = async (facultyID) => {
    try {
      const response = await fetch(`/api/departments/fakultas/prodi/${facultyID}`)

      if (response.ok) {
        const data = await response.json()
        console.log(data);

        setProgramData(data.data);
      } else {
        console.error('Failed to fetch study programs');
      }

    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      // Jika user memilih 'Universitas'
      if (selectedOption === 'Universitas') {
        response = await fetch('/api/website/university', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formWeb)
        });
      }

      // Jika user memilih 'Program Studi'
      else if (addWebsiteOrSelectProgram === 'selectProgram') {
        // Jika data program studi sudah ada
        if (isProgramDataExist === false) {
          response = await fetch(`/api/departments/prodi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: formWeb.name,  // Nama program studi baru
              fakultas_id: selectedFaculty // Hubungkan dengan fakultas yang dipilih
            })
          });
        } else {
          response = await fetch(`/api/website/prodi/${selectedStudyProgram}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formWeb)
          });
        }
      }

      // Jika user memilih 'Fakultas'
      else if (selectedOption === 'Fakultas') {
        // Jika data fakultas belum ada
        if (!isDataExist) {
          response = await fetch('/api/departments/fakultas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: formWeb.name, university_id: formWeb.university_id })
          });
        }

        // Jika data fakultas sudah ada, tambahkan web fakultas
        else {
          response = await fetch(`/api/website/fakultas/${selectedFaculty}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formWeb)
          });
        }
      }

      // Handle respon API
      if (response.ok) {
        const data = await response.json();
        console.log('Post created:', data);
        setFormWebData({
          name: '',
          link: '',
          type: '',
          university_id: process.env.NEXT_PUBLIC_UNIVERSITY_ID
        });
        Swal.fire({
          icon: 'success',
          title: 'Sukses',
          text: 'Sukses Menambahkan Data',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  console.log("is program data exist", isProgramDataExist);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Add Departments"} />
        <main className='p-4 space-y-4'>
          <form className="grid gap-6" onSubmit={handleSubmit}>

            {/* Level Selection */}
            <div className="grid gap-3">
              <Label htmlFor="level">Pilih Tingkat</Label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger id="level" aria-label="Select level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Universitas">Universitas</SelectItem>
                  <SelectItem value="Fakultas">Fakultas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* University Form */}
            {selectedOption === 'Universitas' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <div>
                  <Label htmlFor="university-name">Name</Label>
                  <Input id="university-name" name="name" value={formWeb.name} onChange={handleInputChange} required placeholder="Masukkan nama website" />
                </div>
                <div>
                  <Label htmlFor="university-link">Website Link</Label>
                  <Input id="university-link" name="link" value={formWeb.link} onChange={handleInputChange} required placeholder="Masukkan tautan website" />
                </div>
              </div>
            )}

            {/* Faculty Data Exist Check */}
            {selectedOption === 'Fakultas' && (
              <div className="grid gap-3">
                <Label htmlFor="data-exist">Apakah data fakultas sudah ada?</Label>
                <Select onValueChange={handleDataExistChange}>
                  <SelectTrigger id="data-exist" aria-label="Data exist">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Ya</SelectItem>
                    <SelectItem value="No">Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Faculty Name Form */}
            {selectedOption === 'Fakultas' && !isDataExist && isFacultyFormActive && (
              <div className="grid gap-3">
                <Label htmlFor="faculty-name">Nama fakultas</Label>
                <Input id="faculty-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama fakultas" />
              </div>
            )}

            {/* Faculty Selection Form */}
            {selectedOption === 'Fakultas' && isDataExist && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="faculty">Pilih fakultas</Label>
                  <Select onValueChange={handleFacultySelectChange}>
                    <SelectTrigger id="faculty" aria-label="Pilih fakultas">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyData.map((faculty) => (
                        <SelectItem key={faculty._id} value={faculty._id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tambahkan pilihan antara menambahkan website atau memilih program studi */}
                {selectedFaculty && (
                  <div className="grid gap-3">
                    <Label htmlFor="add-website-or-select-program">Ingin menambahkan website atau memilih program studi?</Label>
                    <Select onValueChange={handleAddWebsiteOrSelectProgramChange}>
                      <SelectTrigger id="add-website-or-select-program" aria-label="Tambah website atau pilih prodi">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="addWebsite">Tambahkan Website Fakultas</SelectItem>
                        <SelectItem value="selectProgram">Pilih Program Studi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Form untuk menambahkan website fakultas */}
                {addWebsiteOrSelectProgram === 'addWebsite' && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="faculty-web-name">Nama Website Fakultas</Label>
                      <Input id="faculty-web-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama website" />
                    </div>
                    <div>
                      <Label htmlFor="faculty-web-link">Tautan Website Fakultas</Label>
                      <Input id="faculty-web-link" name="link" value={formWeb.link} onChange={handleInputChange} placeholder="Masukkan tautan website" />
                    </div>
                  </div>
                )}

                {/* Melanjutkan ke form program studi jika memilih program studi */}
                {addWebsiteOrSelectProgram === 'selectProgram' && (
                  <>
                    <div className="grid gap-3">
                      <Label htmlFor="program-data-exist">Apakah data program studi sudah ada?</Label>
                      <Select onValueChange={handleProgramDataExistChange}>
                        <SelectTrigger id="program-data-exist" aria-label="Apakah data program studi sudah ada?">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Ya</SelectItem>
                          <SelectItem value="No">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {isProgramDataExist === true && (
                      <>
                        <div className="grid gap-3">
                          <Label htmlFor="study-program">Pilih program studi</Label>
                          <Select onValueChange={(value) => {
                            setSelectedStudyProgram(value);
                            setFormWebData((prevData) => ({
                              ...prevData,
                              prodi_id: value // Memasukkan prodi_id ke dalam formWeb
                            }));
                          }}>
                            <SelectTrigger id="study-program" aria-label="Pilih program studi">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              {programData.map((program) => (
                                <SelectItem key={program._id} value={program._id}>
                                  {program.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Form untuk menambahkan website program studi */}
                        {selectedStudyProgram && (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                            <div>
                              <Label htmlFor="study-program-web-name">Nama Website Program Studi</Label>
                              <Input id="study-program-web-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama website program studi" />
                            </div>
                            <div>
                              <Label htmlFor="study-program-web-link">Tautan Website Program Studi</Label>
                              <Input id="study-program-web-link" name="link" value={formWeb.link} onChange={handleInputChange} placeholder="Masukkan tautan website program studi" />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {isProgramDataExist === false && (
                      <div className="grid gap-3">
                        <Label htmlFor="new-program-name">Nama program studi baru</Label>
                        <Input id="new-program-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama program studi" />
                      </div>
                    )}
                  </>
                )}

              </>
            )}
            <div className="flex pt-4 flex-col mx-auto gap-4">
              <Button className="w-96">Submit</Button>
              <Button variant="outline" className="w-96">Cancel</Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default withAuth(Page)
