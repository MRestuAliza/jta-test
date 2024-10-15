"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/General/Sidebar';
import Header from "@/components/General/Header";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import withAuth from '@/libs/withAuth';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import NotFound from '@/app/not-found';
import Swal from 'sweetalert2';

function DetailPage() {
  const [replayComment, setCommentsReplay] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState({});  // Simpan state per comment ID
  const [replyContent, setReplyContent] = useState("");
  const [commentContent, setCommentContent] = useState({
    content: "",
    saran_id: ""
  });
  const [detailAdvice, setDetailAdvice] = useState([]);
  const params = useParams();
  const slug = params.slug || [];
  const [userVotes, setUserVotes] = useState({});
  const { status, data: session } = useSession();
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});

  useEffect(() => {
    if (status === "authenticated") {
      fetchDetail();
    }
  }, [status]);

  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));

    if (!replies[commentId]) {
      fetchReply(commentId);
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    console.log("Reply content:", replyContent);

    try {
      const response = await fetch(`/api/saran/comment/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        Swal.fire({
          icon: 'success',
          title: 'Balasan berhasil dikirim',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setReplyContent("");
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === commentId
              ? {
                ...comment,
                replyIds: Array.isArray(comment.replyIds)
                  ? [...comment.replyIds, result.data]
                  : [result.data]
              }
              : comment
          )
        );

        // Sembunyikan form balasan
        toggleReplyForm(commentId);

      } else {
        console.error("Error submitting reply");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const userId = session.user.id;
    const data = {
      content: commentContent.content,
      saran_id: userId
    };

    try {
      const response = await fetch(`/api/saran/comment?saran_id=${slug[0]}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data, userId
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Sukses',
          text: 'Sukses Menambahkan Komentar',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        alert("Error submitting form");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChangeContent = (e) => {
    const { name, value } = e.target;
    setCommentContent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/saran/vote/d?saranId=${slug[0]}&userId=${session.user.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
        }
        throw new Error("Failed to fetch detail");
      }

      const data = await response.json();
      setDetailAdvice(data.data.saran);
      setUserVotes({
        [data.data.saran._id]: data.data.userVote
      });
      fetchComments();
    } catch (error) {
      console.error("Error fetching detail:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    const response = await fetch(`/api/saran/comment?saran_id=${slug[0]}`);

    try {
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
        }
        throw new Error("Failed to fetch detail");
      }
      const data = await response.json();
      setComments(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchReply = async (commentId) => {
    const response = await fetch(`/api/saran/comment/${commentId}`);

    try {
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
        }
        throw new Error("Failed to fetch detail");
      }
      const data = await response.json();
      setCommentsReplay(Array.isArray(data.data) ? data.data : []);
      setReplies(prevReplies => ({
        ...prevReplies,
        [commentId]: Array.isArray(data.data) ? data.data : [] // Simpan balasan dalam bentuk array
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Replies:', comments);
  if (notFound) {
    return (
      <><NotFound /></>
    );
  }

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
                      value={commentContent.content}
                      name="content"
                      onChange={handleChangeContent}
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
          <div className="w-full mt-6 space-y-4">
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={comment._id || index}> {/* Pastikan key unik untuk setiap komentar */}
                  <Card className="">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                            {comment.created_by?.profilePicture ? (
                              <img
                                src={comment.created_by.profilePicture}
                                alt={comment.created_by?.name || "User profile"}
                                className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-white font-bold">
                                {comment.created_by?.name ? comment.created_by.name[0].toUpperCase() : "D"}
                              </span>
                            )}
                          </div>

                          <div>
                            <CardTitle className="font-bold text-sm">
                              {comment.created_by?.name || "Nama Pengguna"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">
                              {comment.content || "Ini adalah isi komentar dari pengguna."}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center text-black rounded-lg p-2">
                          <Button variant="ghost" className="p-1">
                            <ChevronUp className="h-5 w-5" />
                          </Button>
                          <span className="text-sm">{comment.voteScore || 0}</span>
                          <Button variant="ghost" className="p-1">
                            <ChevronDown className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span> {/* Format tanggal */}
                      <Button
                        variant="link"
                        className="text-xs"
                        onClick={() => toggleReplyForm(comment._id)}
                      >
                        {showReplyForm[comment._id] ? "Sembunyikan Balasan" : "Balas"}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Form balasan hanya ditampilkan jika `showReplyForm` cocok dengan komentar yang sedang ditampilkan */}
                  {showReplyForm[comment._id] && (
                    <div className="ml-10 mt-3">
                      <Card>
                        <form onSubmit={(e) => handleReplySubmit(e, comment._id)}>
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
                            <Button type="submit" className="w-full">Kirim Balasan</Button>
                          </CardFooter>
                        </form>
                      </Card>

                      {/* Tampilkan balasan jika ada */}
                      <div className='space-y-4 mt-3'>
                        {Array.isArray(replies[comment._id]) && replies[comment._id].length > 0 && (
                          replies[comment._id].map((reply) => (
                            <Card key={reply._id}>
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                                      {reply.created_by?.profilePicture ? (
                                        <img
                                          src={reply.created_by.profilePicture}
                                          alt={reply.created_by?.name || "User profile"}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-white font-bold">
                                          {reply.created_by?.name ? reply.created_by.name[0].toUpperCase() : "R"}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <CardTitle className="font-bold text-sm">
                                        {reply.created_by?.name || "Pengguna"}
                                      </CardTitle>
                                      <CardDescription className="text-muted-foreground text-sm">
                                        {reply.content || "Ini adalah balasan terhadap komentar di atas."}
                                      </CardDescription>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                              </CardFooter>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}


                </div>
              ))
            ) : (
              <p className="text-center">Tidak ada komentar.</p>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default withAuth(DetailPage);
