"use client";

import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ChevronUp,
  ChevronDown,
  Bug,
  Lightbulb,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Bell,
  BellOff,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  gathering_interest: "Gathering Interest",
  planned: "Planned",
  in_progress: "In Progress",
  complete: "Complete",
  closed: "Closed",
};

const STATUS_OPTIONS = [
  "gathering_interest",
  "planned",
  "in_progress",
  "complete",
  "closed",
] as const;

const STATUS_CLASSES: Record<string, string> = {
  gathering_interest: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40",
  planned: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40",
  in_progress: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
  complete: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/40",
  closed: "bg-muted text-muted-foreground border-muted-foreground/30",
};

const IMPORTANCE_OPTIONS = [
  { value: "not_important" as const, label: "Not important", color: "bg-muted" },
  { value: "nice_to_have" as const, label: "Nice to have", color: "bg-sky-500/20 text-sky-700 dark:text-sky-300" },
  { value: "important" as const, label: "Important", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  { value: "essential" as const, label: "Essential", color: "bg-green-500/20 text-green-700 dark:text-green-300" },
];

function avatarLetter(name: string | undefined, externalId: string): string {
  if (name && name.trim()) return name.trim().slice(0, 1).toUpperCase();
  return externalId.slice(-1).toUpperCase();
}

function avatarColor(externalId: string): string {
  let h = 0;
  for (let i = 0; i < externalId.length; i++) h = (h << 5) - h + externalId.charCodeAt(i);
  const hue = Math.abs(h % 360);
  return `hsl(${hue}, 55%, 45%)`;
}

export function FeedbackDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id as Id<"feedback"> | undefined;

  const feedback = useQuery(
    api.feedback.get,
    id ? { id } : "skip"
  );
  const allList = useQuery(api.feedback.list);
  const [sortBy, setSortBy] = useState<"top" | "newest">("newest");
  const commentsSorted = useQuery(
    api.feedback.listComments,
    id ? { feedbackId: id, sortBy } : "skip"
  );
  const importanceSummary = useQuery(
    api.feedback.getImportanceSummary,
    id ? { feedbackId: id } : "skip"
  );
  const myRole = useQuery(api.users.getMyRole);
  const isAdmin = myRole?.role === "admin";
  const subscribed = useQuery(
    api.feedback.getSubscription,
    id ? { feedbackId: id } : "skip"
  );

  const voteMutation = useMutation(api.feedback.vote);
  const rateImportanceMutation = useMutation(api.feedback.rateImportance);
  const updateStatusMutation = useMutation(api.feedback.updateFeedbackStatus);
  const updateAdminNotesMutation = useMutation(api.feedback.updateAdminNotes);
  const addCommentMutation = useMutation(api.feedback.addComment);
  const voteCommentMutation = useMutation(api.feedback.voteComment);
  const setSubscriptionMutation = useMutation(api.feedback.setSubscription);

  const [commentBody, setCommentBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"feedbackComments"> | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [similarExpanded, setSimilarExpanded] = useState(false);

  useEffect(() => {
    if (feedback && feedback.adminNotes !== undefined)
      setAdminNotes(feedback.adminNotes ?? "");
  }, [feedback?.adminNotes]);

  const canEditStatusFinal = feedback && (isAdmin || (feedback as { isCreator?: boolean }).isCreator);

  const similarPosts = useMemo(() => {
    if (!id || !allList || !feedback) return [];
    const words = new Set(
      feedback.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
    return allList
      .filter((item) => item._id !== id && item.board === feedback.board)
      .filter((item) => {
        const titleWords = item.title.toLowerCase().split(/\s+/);
        return titleWords.some((w) => words.has(w));
      })
      .slice(0, 5);
  }, [id, allList, feedback]);

  const handleAddComment = async (body: string, parentId?: Id<"feedbackComments">) => {
    if (!id || !body.trim()) return;
    setSubmittingComment(true);
    try {
      await addCommentMutation({
        feedbackId: id,
        body: body.trim(),
        ...(parentId && { parentId }),
      });
      setCommentBody("");
      setReplyBody("");
      setReplyingTo(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      await updateAdminNotesMutation({ id, adminNotes: adminNotes });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Invalid feedback ID.</p>
        <Link to="/feedback" className="text-primary underline font-semibold uppercase">
          Back to feedback
        </Link>
      </div>
    );
  }

  if (feedback === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary">Loading…</p>
      </div>
    );
  }

  if (feedback === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Feedback not found.</p>
        <Link to="/feedback" className="text-primary font-semibold uppercase underline">
          Back to feedback
        </Link>
      </div>
    );
  }

  const creatorName = feedback.name || feedback.email || "Unknown";

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none opacity-30 base-pattern" aria-hidden />
      <LynxHeader subtitle="Feedback & feature requests" activePage="feedbackDetail" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Link
          to="/feedback"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-primary hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Back to feedback
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {feedback.title}
            </h1>

            <Card className="border-2 border-accent/40 mb-6">
              <CardContent className="p-4">
                <div className="whitespace-pre-wrap text-foreground">
                  {feedback.description}
                </div>
              </CardContent>
            </Card>

            {/* Importance poll */}
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
                How important is this to you?
              </p>
              <div className="flex flex-wrap gap-2">
                {IMPORTANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      rateImportanceMutation({ feedbackId: id, rating: opt.value })
                    }
                    className={`px-3 py-2 rounded border text-sm font-medium ${
                      feedback.myImportance === opt.value
                        ? "border-accent bg-accent/20 " + opt.color
                        : "border-muted-foreground/40 hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                    {importanceSummary && importanceSummary[opt.value] > 0 && (
                      <span className="ml-1 text-muted-foreground">
                        ({importanceSummary[opt.value]})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Similar posts */}
            {similarPosts.length > 0 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setSimilarExpanded((e) => !e)}
                  className="text-sm font-semibold uppercase text-primary hover:underline"
                >
                  {similarExpanded ? "Hide" : "View"} similar posts ({similarPosts.length})
                </button>
                {similarExpanded && (
                  <ul className="mt-2 space-y-2">
                    {similarPosts.map((item) => (
                      <li key={item._id}>
                        <Link
                          to={`/feedback/${item._id}`}
                          className="text-sm text-primary hover:underline block"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-8">
              Submitted by {creatorName} ·{" "}
              {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </p>

            {/* Comments */}
            <div className="border-t border-accent/40 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold uppercase">
                  Comments ({(commentsSorted ?? []).length})
                </h2>
                <div className="flex rounded-none border-2 border-accent overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSortBy("top")}
                    className={`px-4 py-2 text-sm font-semibold uppercase ${
                      sortBy === "top" ? "bg-accent text-accent-foreground" : "bg-background hover:bg-accent/20"
                    }`}
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("newest")}
                    className={`px-4 py-2 text-sm font-semibold uppercase ${
                      sortBy === "newest" ? "bg-accent text-accent-foreground" : "bg-background hover:bg-accent/20"
                    }`}
                  >
                    Newest
                  </button>
                </div>
              </div>

              <Card className="border-2 border-accent/40 mb-6">
                <CardContent className="p-4">
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write a comment…"
                    rows={3}
                    className="w-full rounded border-2 border-accent bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    className="mt-2 uppercase font-semibold rounded-none bg-accent text-accent-foreground"
                    disabled={submittingComment || !commentBody.trim()}
                    onClick={() => handleAddComment(commentBody)}
                  >
                    {submittingComment ? "Posting…" : "Comment"}
                  </Button>
                </CardContent>
              </Card>

              <ul className="space-y-4">
                {commentsSorted &&
                  commentsSorted
                    .filter((c) => !c.parentId)
                    .map((comment) => (
                      <li key={comment._id}>
                        <CommentBlock
                          comment={comment}
                          replies={commentsSorted?.filter((r) => r.parentId === comment._id) ?? []}
                          onVote={(commentId, value) =>
                            voteCommentMutation({ commentId, value })
                          }
                          onReply={() => setReplyingTo(comment._id)}
                          replyingTo={replyingTo}
                          replyBody={replyBody}
                          setReplyBody={setReplyBody}
                          onSubmitReply={() =>
                            handleAddComment(replyBody, comment._id)
                          }
                          onCancelReply={() => {
                            setReplyingTo(null);
                            setReplyBody("");
                          }}
                          avatarColor={avatarColor}
                          avatarLetter={avatarLetter}
                        />
                      </li>
                    ))}
              </ul>
            </div>

            {/* Admin notes */}
            {isAdmin && (
              <Card className="mt-8 border-2 border-accent/40">
                <CardContent className="p-4">
                  <Label className="text-sm font-semibold uppercase">Internal notes</Label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Admin-only notes…"
                    rows={3}
                    className="mt-2 w-full rounded border-2 border-accent bg-card px-3 py-2 text-sm"
                  />
                  <Button
                    size="sm"
                    className="mt-2 uppercase font-semibold rounded-none border-accent"
                    disabled={savingNotes}
                    onClick={handleSaveAdminNotes}
                  >
                    {savingNotes ? "Saving…" : "Save notes"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <Card className="border-2 border-accent/40">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Votes
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      voteMutation({
                        feedbackId: id,
                        value: feedback.myVote === 1 ? 0 : 1,
                      })
                    }
                    className="p-2 rounded hover:bg-accent/20"
                    aria-label={feedback.myVote === 1 ? "Remove upvote" : "Upvote"}
                  >
                    <ChevronUp
                      className={`w-6 h-6 ${feedback.myVote === 1 ? "text-primary fill-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                  <span className="text-xl font-bold tabular-nums">
                    {feedback.voteScore}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      voteMutation({
                        feedbackId: id,
                        value: feedback.myVote === -1 ? 0 : -1,
                      })
                    }
                    className="p-2 rounded hover:bg-accent/20"
                    aria-label={feedback.myVote === -1 ? "Remove downvote" : "Downvote"}
                  >
                    <ChevronDown
                      className={`w-6 h-6 ${feedback.myVote === -1 ? "text-destructive fill-destructive" : "text-muted-foreground"}`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/40">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Status
                </p>
                {canEditStatusFinal ? (
                  <select
                    value={feedback.status}
                    onChange={(e) =>
                      updateStatusMutation({
                        id,
                        status: e.target.value as typeof feedback.status,
                      })
                    }
                    className="w-full rounded border-2 border-accent bg-background px-3 py-2 text-sm uppercase font-semibold"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`inline-block text-xs font-semibold uppercase px-2 py-1 rounded border ${STATUS_CLASSES[feedback.status] ?? "bg-muted"}`}
                  >
                    {STATUS_LABELS[feedback.status] ?? feedback.status}
                  </span>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/40">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Board
                </p>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {feedback.board === "bug_report" ? (
                    <Bug className="w-4 h-4" aria-hidden />
                  ) : (
                    <Lightbulb className="w-4 h-4" aria-hidden />
                  )}
                  {feedback.board === "feature_request"
                    ? "Feature Request"
                    : "Bug Report"}
                </span>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/40">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Get notified
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full uppercase font-semibold rounded-none border-accent"
                  onClick={() =>
                    setSubscriptionMutation({
                      feedbackId: id,
                      subscribed: !subscribed,
                    })
                  }
                >
                  {subscribed ? (
                    <>
                      <BellOff className="w-4 h-4 mr-2" aria-hidden />
                      Unsubscribe
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" aria-hidden />
                      Get notified
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

type CommentLike = {
  _id: Id<"feedbackComments">;
  parentId?: Id<"feedbackComments">;
  externalId: string;
  name?: string;
  body: string;
  createdAt: number;
  likeCount: number;
  dislikeCount: number;
  myVote: number | null;
};

function CommentBlock({
  comment,
  replies,
  onVote,
  onReply,
  replyingTo,
  replyBody,
  setReplyBody,
  onSubmitReply,
  onCancelReply,
  avatarColor,
  avatarLetter,
}: {
  comment: CommentLike;
  replies: CommentLike[];
  onVote: (commentId: Id<"feedbackComments">, value: 1 | -1 | 0) => void;
  onReply: () => void;
  replyingTo: Id<"feedbackComments"> | null;
  replyBody: string;
  setReplyBody: (s: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  avatarColor: (id: string) => string;
  avatarLetter: (name: string | undefined, id: string) => string;
}) {
  const isReplyActive = replyingTo === comment._id;
  return (
    <Card className="border-2 border-accent/40">
      <CardContent className="p-4">
      <div className="flex gap-3">
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor(comment.externalId) }}
          aria-hidden
        >
          {avatarLetter(comment.name, comment.externalId)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{comment.name ?? "Anonymous"}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
            {comment.body}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => onVote(comment._id, comment.myVote === 1 ? 0 : 1)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label={comment.myVote === 1 ? "Remove like" : "Like"}
            >
              <ThumbsUp
                className={`w-4 h-4 ${comment.myVote === 1 ? "text-primary fill-primary" : ""}`}
              />
              {comment.likeCount}
            </button>
            <button
              type="button"
              onClick={() => onVote(comment._id, comment.myVote === -1 ? 0 : -1)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label={comment.myVote === -1 ? "Remove dislike" : "Dislike"}
            >
              <ThumbsDown
                className={`w-4 h-4 ${comment.myVote === -1 ? "text-destructive fill-destructive" : ""}`}
              />
              {comment.dislikeCount}
            </button>
            <button
              type="button"
              onClick={onReply}
              className="text-xs font-semibold uppercase text-primary hover:underline flex items-center gap-1"
            >
              <Reply className="w-3 h-3" aria-hidden />
              Reply
            </button>
          </div>
          {isReplyActive && (
            <div className="mt-4">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="w-full rounded border-2 border-accent bg-card px-3 py-2 text-sm"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="uppercase font-semibold rounded-none bg-accent"
                  onClick={onSubmitReply}
                  disabled={!replyBody.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="uppercase font-semibold rounded-none border-accent"
                  onClick={onCancelReply}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {replies.length > 0 && (
            <ul className="mt-4 pl-6 border-l-2 border-muted space-y-3">
              {replies.map((r) => (
                <li key={r._id}>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: avatarColor(r.externalId) }}
                    >
                      {avatarLetter(r.name, r.externalId)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.name ?? "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {r.body}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => onVote(r._id, r.myVote === 1 ? 0 : 1)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ThumbsUp
                            className={`w-3 h-3 ${r.myVote === 1 ? "text-primary fill-primary" : ""}`}
                          />
                          {r.likeCount}
                        </button>
                        <button
                          type="button"
                          onClick={() => onVote(r._id, r.myVote === -1 ? 0 : -1)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ThumbsDown
                            className={`w-3 h-3 ${r.myVote === -1 ? "text-destructive fill-destructive" : ""}`}
                          />
                          {r.dislikeCount}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
