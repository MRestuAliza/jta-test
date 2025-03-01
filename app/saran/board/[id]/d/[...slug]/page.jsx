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
import Swal from 'sweetalert2';
import { debounce, set } from 'lodash';

function DetailPage() {
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replyContents, setReplyContents] = useState({});
  const [commentContent, setCommentContent] = useState({
    content: "",
    saran_id: ""
  });
  const [detailAdvice, setDetailAdvice] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReplayComment, setIsSubmittingReplayComment] = useState(false);
  const params = useParams();
  console.log("tes paramss", params);
  
  const slug = params.slug || [];
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchDetail();
      fetchComments();
      fetchUserVotes();
    }
  }, [status]);

  useEffect(() => {
    if (comments.length > 0) {
      fetchUserVotes();
    }
  }, [comments]);

  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleReplyChange = (commentId, value) => {
    setReplyContents(prev => ({
      ...prev,
      [commentId]: value
    }));
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (isSubmittingReplayComment) return
    setIsSubmittingReplayComment(true);

    const userId = session.user.id;
    try {
      const content = replyContents[commentId] || '';

      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          saran_id: slug[0],
          ref_comment_id: commentId,
          created_by: userId
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Sukses',
          text: 'Balasan berhasil dikirim',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setReplyContents(prev => ({
          ...prev,
          [commentId]: ''
        }));

        fetchComments();
      } else {
        alert("Error submitting reply");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmittingReplayComment(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const userId = session.user.id;

    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentContent.content,
          saran_id: slug[0],
          created_by: userId
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
        });
        setCommentContent({ content: "", saran_id: slug[0] });
        fetchComments();
      } else {
        alert("Error submitting comment");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/saran?sid=${slug[0]}`);
      if (!response.ok) {
        throw new Error("Failed to fetch detail");
      }
      const data = await response.json();
      setDetailAdvice(data.data);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?saran_id=${slug[0]}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.data);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const userId = session.user.id;
      const votesData = {};

      for (const item of comments) {
        const response = await fetch(`/api/saran/vote/comments?commentsId=${item._id}&userId=${userId}`);
        if (response.ok) {
          const { userVote } = await response.json();
          votesData[item._id] = userVote;
        } else if (response.status === 404) {
          console.warn(`Data not found for saranId ${item._id}`);
          votesData[item._id] = 0;
        }
      }
      setUserVotes(votesData);
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  // Handle voting
  const handleVote = debounce(async (commentsId, type) => {
    const voteType = type === "upvote" ? 1 : -1;
    try {
      if (!session?.user?.id) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const response = await fetch(`/api/saran/vote/comments`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentsId,
          userId: session.user.id,
          voteType
        })
      });

      if (response.ok) {
        const { success, voteScore, userVote } = await response.json();
        if (success && typeof voteScore !== 'undefined') {
          setComments(prev =>
            prev.map(item =>
              item._id === commentsId ? { ...item, voteScore } : item
            )
          );
          setUserVotes(prev => ({
            ...prev,
            [commentsId]: userVote
          }));
        }
      }
    } catch (error) {
      console.error('Error while voting:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        timer: 2000
      });
    }
  }, 500);

  if (notFound) {
    return <NotFound />;
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
                  <CardDescription className="text-muted-foreground">
                    {detailAdvice.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{comments.length}</span>
              </div>
            </CardFooter>
          </Card>

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
                      onChange={(e) => setCommentContent({
                        ...commentContent,
                        content: e.target.value
                      })}
                      placeholder="Tulis komentar Anda di sini..."
                      className="min-h-24"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Mengirim...' : ' Kirim Komentar'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div className="w-full mt-6 space-y-4">
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                            {comment.created_by?.profile_picture ? (
                              <img
                                src={comment.created_by.profile_picture}
                                alt={comment.created_by?.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {comment.created_by?.name ?
                                  comment.created_by.name[0] : "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <CardTitle className="font-bold text-sm">
                              {comment.created_by?.name}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">
                              {comment.content}
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex items-center text-black rounded-lg p-2">
                          <Button
                            variant="ghost"
                            className="p-1"
                            onClick={() => handleVote(comment._id, 'upvote')}
                          >
                            <ChevronUp
                              className={`h-6 w-6 ${userVotes[comment._id] === 1 ?
                                'bg-[#10172A] rounded-sm text-white' : ''
                                }`}
                            />
                          </Button>
                          <span>{comment.voteScore}</span>
                          <Button
                            variant="ghost"
                            className="p-1"
                            onClick={() => handleVote(comment._id, 'downvote')}
                          >
                            <ChevronDown
                              className={`h-6 w-6 ${userVotes[comment._id] === -1 ?
                                'bg-[#10172A] rounded-sm text-white' : ''
                                }`}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="link"
                        className="text-xs"
                        onClick={() => toggleReplyForm(comment._id)}
                      >
                        {showReplyForm[comment._id] ?
                          "Sembunyikan Balasan" : "Balas"}
                      </Button>
                    </CardFooter>
                  </Card>

                  {showReplyForm[comment._id] && (
                    <div className="ml-10 mt-3">
                      <Card>
                        <form onSubmit={(e) => handleReplySubmit(e, comment._id)}>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Balas Komentar
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              required
                              id={`reply-${comment._id}`}
                              name="reply"
                              value={replyContents[comment._id] || ''}
                              onChange={(e) =>
                                handleReplyChange(comment._id, e.target.value)
                              }
                              placeholder="Tulis balasan Anda..."
                              className="min-h-24"
                            />
                          </CardContent>
                          <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmittingReplayComment}>
                              {isSubmittingReplayComment ? 'Mengirim...' : 'Kirim Balasan'}
                            </Button>
                          </CardFooter>
                        </form>
                      </Card>

                      <div className='mt-3 space-y-4'>
                        {comment.replies && comment.replies.length > 0 ? (
                          comment.replies
                            .filter(reply =>
                              reply && reply.content && reply.created_at
                            )
                            .map((reply) => (
                              <Card key={reply._id}>
                                <CardHeader className="pb-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        {reply.created_by?.profile_picture ? (
                                          <img
                                            src={reply.created_by.profile_picture}
                                            alt={reply.created_by?.name}
                                            className="w-full h-full rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full rounded-full bg-gray-300" />
                                        )}
                                      </div>
                                      <div>
                                        <CardTitle className="font-bold text-xs">
                                          {reply.created_by?.name || "Pengguna"}
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground text-xs">
                                          {reply.content}
                                        </CardDescription>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                                  <span>
                                    {reply.created_at ?
                                      new Date(reply.created_at).toLocaleDateString()
                                      : "Tanggal tidak valid"}
                                  </span>
                                </CardFooter>
                              </Card>
                            ))
                        ) : (
                          <p className="text-center text-muted-foreground">
                            Tidak ada balasan
                          </p>
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