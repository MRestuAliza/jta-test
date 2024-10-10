"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { ChevronDown, ChevronUp, MessageSquare, } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import withAuth from '@/libs/withAuth';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { set } from 'mongoose';

function DetailPage() {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [detailAdvice, setDetailAdvice] = useState([]);
  const params = useParams();
  const slug = params.slug || [];
  const [userVotes, setUserVotes] = useState({});
  // const toggleReplies = () => setShowReplies(!showReplies);
  const toggleReplyForm = () => setShowReplyForm(!showReplyForm);
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchDetail()
    }
  }, [status])

  const handleReplySubmit = (e) => {
    e.preventDefault();
    console.log("Reply content:", replyContent);
    setReplyContent("");
    setShowReplyForm(false);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    console.log("Comment content:", commentContent);
    setCommentContent("");
  };

  const fetchDetail = async () => {
    try {
      const response = await fetch(`/api/saran/vote/d?saranId=${slug[0]}&userId=${session.user.id}`);
      if (!response) {
        throw new Error("Failed to fetch detail");
      }
      const data = await response.json();
      setDetailAdvice(data.data.saran);
      setUserVotes({
        [data.data.saran._id]: data.data.userVote 
      });

    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  }

  console.log("Detail Advice vote:", detailAdvice);

  const handleVote = async (saranId, voteType) => {
    try {
      if (!session || !session.user || !session.user.id) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const userId = session.user.id;

      const response = await fetch(`/api/saran/vote?saranId=${saranId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, voteType })
      });

      if (response.ok) {
        const updatedSaran = await response.json();

        if (updatedSaran && updatedSaran.data && typeof updatedSaran.data.voteScore !== 'undefined') {
          setDetailAdvice(prev => ({
            ...prev,
            voteScore: updatedSaran.data.voteScore
          }));

          
          setUserVotes(prev => ({
            ...prev,
            [saranId]: voteType  
          }));
        } else {
          console.error("Vote data not found or invalid response");
        }
      } else {
        console.error('Failed to update vote');
      }
    } catch (error) {
      console.error('Error while voting:', error);
    }
  };




  console.log("Detail Advice:", userVotes);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
        <Header BreadcrumbLinkTitle={"Departments"} />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0">

          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-bold text-lg">{detailAdvice.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{detailAdvice.description}</CardDescription>
                </div>
                <div className="flex items-center text-black rounded-lg p-2">
                  <Button variant="ghost" className="p-1" onClick={() => handleVote(detailAdvice._id, 'upvote')}>
                    <ChevronUp className={`h-6 w-6 ${userVotes[detailAdvice._id] === 'upvote' ? ' bg-[#10172A] rounded-sm text-white' : ''}`} />
                  </Button>
                  <span>{detailAdvice.voteScore}</span>
                  <Button variant="ghost" className="p-1" onClick={() => handleVote(detailAdvice._id, 'downvote')}>
                    <ChevronDown className={`h-6 w-6 ${userVotes[detailAdvice._id] === 'downvote' ? ' bg-[#10172A] rounded-sm text-white' : ''}`} />
                  </Button>
                </div>

              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>12 </span>
              </div>
            </CardFooter>
          </Card>

          {/* Form untuk menambahkan komentar pertama kali */}
          <div className="w-full mt-6">
            <Card>
              <form onSubmit={handleCommentSubmit}>
                <CardHeader>
                  <CardTitle>Tambahkan Komentar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Textarea
                      required
                      id="comment"
                      name="comment"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Tulis komentar Anda di sini..."
                      className="min-h-24"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit">Kirim Komentar</Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Komentar Utama */}
          <div className="w-full mt-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {/* Foto profil sementara dengan background color */}
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <div>
                      <CardTitle className="font-bold text-sm">Nama Pengguna</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Ini adalah isi komentar dari pengguna. Komentar ini memberikan pandangan atau saran terkait topik.
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center text-black rounded-lg p-2">
                    <Button variant="ghost" className="p-1">
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <span className="text-sm">12</span>
                    <Button variant="ghost" className="p-1">
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Oct 2, 2024</span>
                {/* Button untuk memunculkan form balasan */}
                <Button variant="link" className="text-xs" onClick={toggleReplyForm}>
                  {showReplyForm ? "Sembunyikan Balasan" : "Balas"}
                </Button>
              </CardFooter>
            </Card>

            {/* Form Balasan muncul ketika showReplyForm true */}
            {showReplyForm && (
              <div className="ml-10 mt-3">
                <Card>
                  <form onSubmit={handleReplySubmit}>
                    <CardHeader>
                      <CardTitle className="text-sm">Balas Komentar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        required
                        id="reply"
                        name="reply"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Tulis balasan Anda..."
                        className="min-h-24"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full">
                        Kirim Balasan
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}

            {/* Contoh Balasan */}
            {showReplies && (
              <div className="ml-10 mt-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {/* Foto profil sementara dengan background color */}
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-white font-bold">B</span>
                        </div>
                        <div>
                          <CardTitle className="font-bold text-sm">Nama Pengguna Lain</CardTitle>
                          <CardDescription className="text-muted-foreground text-sm">
                            Ini adalah balasan terhadap komentar di atas. Balasan ini menunjukkan pandangan lain.
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Oct 3, 2024</span>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuth(DetailPage);
