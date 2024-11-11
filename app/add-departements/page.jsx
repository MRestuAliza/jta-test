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
    department_id: ""
  });

  const [facultyData, setFacultyData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const { status, data: session } = useSession();
  const [addWebsiteOrSelectProgram, setAddWebsiteOrSelectProgram] = useState('');

  useEffect(() => {
    if (status === "authenticated") {
      fetchFaculty();
    }
  }, [status]);

  console.log("Data Fakultas:", session?.user?.departementId);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormWebData((prevData) => ({
      ...prevData,
      [name]: value,
      department_id: prevData.department_id
    }));
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
      const response = await fetch(`/api/institusi?id=${process.env.NEXT_PUBLIC_UNIVERSITY_ID}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Data fakultas yang diambil:", data);
        setFacultyData({ fakultas_list: data.data.fakultas_list || [] });
        checkMatchingFaculty(data.data.fakultas_list || [])
      } else {
        console.error('Failed to fetch faculties');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkMatchingFaculty = (fetchedData) => {
    const matchedFaculty = fetchedData.find(faculty => faculty.id === session?.user?.departementId);
    if (matchedFaculty && session?.user?.role !== 'Super Admin') {
      setSelectedFaculty(matchedFaculty.id);
      fetchProdi(matchedFaculty.id);
    } else {
      console.log("Tidak ada kecocokan untuk departmentId");
    }
  };

  console.log("Selected Faculty:", selectedFaculty);

  const handleFacultySelectChange = (value) => {
    setSelectedFaculty(value);
    setFormWebData((prevData) => ({
      ...prevData,
      department_id: value
    }));
    fetchProdi(value);
    setIsProgramDataExist(null);
  };

  const handleProdiSelectChange = (value) => {
    setSelectedStudyProgram(value);
    setFormWebData((prevData) => ({
      ...prevData,
      department_id: value
    }));
  }

  const handleDataExistChange = (value) => {
    const exists = value === 'Yes';
    setIsDataExist(exists);
    if (!exists) {
      setIsFacultyFormActive(true);
    } else {
      setIsFacultyFormActive(false);
    }

    setIsProgramDataExist(null);
    setSelectedStudyProgram('');
  };

  const handleProgramDataExistChange = (value) => {
    const exists = value === 'Yes';
    setIsProgramDataExist(exists);
  };

  const handleAddWebsiteOrSelectProgramChange = (value) => {
    setAddWebsiteOrSelectProgram(value);
    console.log("Add website or select program changed to:", value);

    if (value === 'addWebsite') {
      setFormWebData((prevData) => ({
        ...prevData,
        department_id: session?.user?.departementId || '',
        type: 'Fakultas'
      }));
    } else if (value === 'selectProgram') {
      setFormWebData((prevData) => ({
        ...prevData,
        type: 'Prodi'
      }));
    }
  };


  const fetchProdi = async (facultyID) => {
    try {
      const response = await fetch(`/api/institusi?id=${facultyID}`)

      if (response.ok) {
        const data = await response.json();
        setProgramData({ prodi_list: data.data.prodi_list || [] });
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
      let updatedFormWeb = { ...formWeb };

      if (session?.user?.role === 'Super Admin') {
        if (selectedOption === 'Universitas') {
          updatedFormWeb.department_id = process.env.NEXT_PUBLIC_UNIVERSITY_ID;
          updatedFormWeb.type = 'Universitas';
        } else if (selectedOption === 'Fakultas') {
          updatedFormWeb.type = 'Fakultas';
          if (!isDataExist) {
            updatedFormWeb.ref_ids = [process.env.NEXT_PUBLIC_UNIVERSITY_ID];
          } else {
            updatedFormWeb.department_id = selectedFaculty;
          }
        }
      } else if (session?.user?.type === 'Prodi') {
        updatedFormWeb.department_id = session.user.departementId;
        updatedFormWeb.type = 'Prodi';
      } else {
        if (addWebsiteOrSelectProgram === 'addWebsite') {
          updatedFormWeb.department_id = session.user.departementId;
          updatedFormWeb.type = 'Fakultas';
        } else if (addWebsiteOrSelectProgram === 'selectProgram') {
          updatedFormWeb.type = 'Prodi';
          if (isProgramDataExist === false) {
            updatedFormWeb.ref_ids = [process.env.NEXT_PUBLIC_UNIVERSITY_ID, selectedFaculty];
          } else {
            updatedFormWeb.department_id = selectedStudyProgram;
          }
        }
      }
      console.log("Data yang akan dikirim:", updatedFormWeb);


      if (selectedOption === 'Universitas') {
        response = await fetch('/api/website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedFormWeb)
        });
      } else if (addWebsiteOrSelectProgram === 'addWebsite') {
        response = await fetch('/api/website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedFormWeb)
        });
      } else if (addWebsiteOrSelectProgram === 'selectProgram') {
        if (isProgramDataExist === false) {
          response = await fetch(`/api/institusi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: formWeb.name,
              type: 'Prodi',
              ref_ids: [process.env.NEXT_PUBLIC_UNIVERSITY_ID, selectedFaculty]
            })
          });
        } else {
          response = await fetch(`/api/website`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: formWeb.name,
              link: formWeb.link,
              type: 'Prodi',
              department_id: selectedStudyProgram
            })
          });
        }
      } else if (selectedOption === 'Fakultas') {
        if (!isDataExist) {
          response = await fetch('/api/institusi', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: formWeb.name,
              type: 'Fakultas',
              ref_ids: [process.env.NEXT_PUBLIC_UNIVERSITY_ID]
            })
          });
        } else {
          response = await fetch(`/api/website`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFormWeb)
          });
        }
      } else if (session?.user?.type === 'Prodi') {
        response = await fetch('/api/website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedFormWeb)
        });
      } else {
        console.error("Tidak ada opsi yang cocok");
      }

      console.log("Response dari server:", response);


      if (response && response.ok) {
        const data = await response.json();
        console.log('Website successfully added:', data);
        setFormWebData({
          name: '',
          link: '',
          type: '',
          department_id: ''
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



  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Add Departments"} />
        <main className='p-4 space-y-4'>
          <form className="grid gap-6" onSubmit={handleSubmit}>

            {session?.user?.role === 'Super Admin' && (
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
            )}

            {selectedOption === 'Universitas' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <div>
                  <Label htmlFor="university-name">Nama Universitas</Label>
                  <Input id="university-name" name="name" value={formWeb.name} onChange={handleInputChange} required placeholder="Masukkan nama website universitas" />
                </div>
                <div>
                  <Label htmlFor="university-link">Tautan Website</Label>
                  <Input id="university-link" name="link" value={formWeb.link} onChange={handleInputChange} required placeholder="Masukkan tautan website" />
                </div>
              </div>
            )}

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

            {selectedOption === 'Fakultas' && !isDataExist && isFacultyFormActive && (
              <div className="grid gap-3">
                <Label htmlFor="faculty-name">Nama Fakultas</Label>
                <Input id="faculty-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama fakultas" />
              </div>
            )}

            {selectedOption === 'Fakultas' && isDataExist && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="faculty">Pilih fakultas</Label>
                  <Select onValueChange={handleFacultySelectChange}>
                    <SelectTrigger id="faculty" aria-label="Pilih fakultas">
                      <SelectValue placeholder="Pilih fakultas" />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyData?.fakultas_list?.length > 0 ? (
                        facultyData.fakultas_list.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled>Tidak ada fakultas</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

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

                {addWebsiteOrSelectProgram === 'addWebsite' && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="faculty-web-name">Nama Website Fakultas</Label>
                      <Input id="faculty-web-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama website fakultas" />
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
                          <Select onValueChange={handleProdiSelectChange}>
                            <SelectTrigger id="study-program" aria-label="Pilih program studi">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              {facultyData?.fakultas_list?.length > 0 ? (
                                programData.prodi_list.map((faculty) => (
                                  <SelectItem key={faculty._id} value={faculty._id}>
                                    {faculty.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled>Tidak ada fakultas</SelectItem>
                              )}
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

            {session?.user?.role !== 'Super Admin' && (
              <>
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

                {addWebsiteOrSelectProgram === 'addWebsite' && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="faculty-web-name">Nama Website Fakultas</Label>
                      <Input id="faculty-web-name" name="name" value={formWeb.name} onChange={handleInputChange} placeholder="Masukkan nama website fakultas" />
                    </div>
                    <div>
                      <Label htmlFor="faculty-web-link">Tautan Website Fakultas</Label>
                      <Input id="faculty-web-link" name="link" value={formWeb.link} onChange={handleInputChange} placeholder="Masukkan tautan website" />
                    </div>
                  </div>
                )}

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
                          <Select onValueChange={handleProdiSelectChange}>
                            <SelectTrigger id="study-program" aria-label="Pilih program studi">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              {facultyData?.fakultas_list?.length > 0 ? (
                                programData.prodi_list.map((faculty) => (
                                  <SelectItem key={faculty._id} value={faculty._id}>
                                    {faculty.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled>Tidak ada fakultas</SelectItem>
                              )}
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

            {session?.user?.type === 'Prodi' && (
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

export default withAuth(Page);
