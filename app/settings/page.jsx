"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/General/Sidebar";
import { useSession } from "next-auth/react";
import Swal from 'sweetalert2';
import Loading from '@/components/General/Loading';
import withAuth from '@/libs/withAuth';
import Link from "next/link";


function Settings() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [session, status]);

  const fetchData = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/auth/users/${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error("Error fetching user data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];


    const validExtensions = ["image/jpeg", "image/jpg", "image/png"];
    if (file && validExtensions.includes(file.type) && file.size <= MAX_FILE_SIZE) {
      setProfilePicture(file);
    } else {
      setLoadingForm(false);
      Swal.fire({
        icon: 'error',
        title: 'Oops',
        text: "Hanya file JPG, JPEG, PNG dan ukuran maksimal 2MB yang diizinkan.",
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
      setProfilePicture(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      let response;
      if (profilePicture) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("nim", nim);
        formData.append("password", password);
        formData.append("newPassword", newPassword);
        formData.append("profilePicture", profilePicture);

        response = await fetch(`/api/auth/users?userId=${session.user.id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {

        const data = {
          name,
          email,
          nim,
          password,
          newPassword,
        };

        response = await fetch(`/api/auth/users?userId=${session.user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      if (response.ok) {
        setLoadingForm(false);
        const data = await response.json();
        setMessage("Profile updated successfully");
        setUser(data.user);
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
        setLoadingForm(false);
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Oops',
          text: `${errorData.message || "Failed to update profile"}`,
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
        setMessage(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("An error occurred while updating profile");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Sidebar />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] bg-gray-100/40 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 dark:bg-gray-800/40">
        <div className="max-w-6xl w-full mx-auto grid gap-2">
          <h1 className="font-semibold text-3xl">Settings</h1>
        </div>
        <div className="grid items-start gap-6  max-w-6xl w-full mx-auto">
          <div className="grid gap-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Update your profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  {profilePicture && (
                    <p className="text-sm text-gray-600">Selected file: {profilePicture.name}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Label>Nama</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={user?.name} />

                  {session?.user?.role === "Mahasiswa" && (
                    <div>
                      <Label>NIM Mahasiswa</Label>
                      <Input value={nim} onChange={(e) => setNim(e.target.value)} placeholder="f1*******" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Perbarui Email</CardTitle>
                  <CardDescription>Perbarui email akun kamu.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input placeholder="Email Terbaru" type="email" value={email}  onChange={(e) => setEmail(e.target.value)}/>
                </CardContent>
              </Card>
              {user?.loginProvider === "credentials" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Perbarui Kata Sandi</CardTitle>
                    <CardDescription>Perbarui kata sandi akun kamu.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <Label>Password Lama</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password lama"
                    />

                    <Label>Password Baru</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                    />
                  </CardContent>
                </Card>
              )}
              {message && (
                <p className="text-red-500 text-center">{message}</p>
              )}
              <Button type="submit" className="w-full">
                {loadingForm ? <Loading /> : "Simpan"}
              </Button>
            </form>
            <Button variant="outline" className="text-red-500 border-red-500 w-full">
              <Link href="/dashboard">Kembali</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(Settings);