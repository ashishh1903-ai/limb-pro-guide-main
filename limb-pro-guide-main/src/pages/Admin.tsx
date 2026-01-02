import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Check, Clock, AlertCircle, Bug, Lightbulb, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";

interface Feedback {
  id: string;
  user_id: string;
  user_email: string | null;
  message: string;
  type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  feature: <Lightbulb className="h-4 w-4" />,
  general: <MessageSquare className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!adminLoading && !isAdmin && user) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    if (isAdmin) {
      fetchFeedback();
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  async function fetchFeedback() {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }

  async function updateFeedbackStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateAdminNotes(id: string, notes: string) {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ admin_notes: notes })
        .eq("id", id);

      if (error) throw error;

      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, admin_notes: notes } : f))
      );
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  }

  const filteredFeedback = feedback.filter((f) => {
    if (filter === "all") return true;
    return f.status === filter || f.type === filter;
  });

  const stats = {
    total: feedback.length,
    pending: feedback.filter((f) => f.status === "pending").length,
    bugs: feedback.filter((f) => f.type === "bug").length,
    features: feedback.filter((f) => f.type === "feature").length,
  };

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage user feedback</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4 md:p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Feedback</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bug Reports</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.bugs}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Feature Requests</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.features}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedback</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="bug">Bug Reports</SelectItem>
              <SelectItem value="feature">Feature Requests</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredFeedback.length} items
          </span>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No feedback found</p>
              <p className="text-sm text-muted-foreground">
                {filter === "all"
                  ? "No feedback has been submitted yet."
                  : "No feedback matches your filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {typeIcons[item.type] || typeIcons.general}
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <CardDescription>{item.user_email || "Anonymous"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-foreground">{item.message}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Select
                      value={item.status}
                      onValueChange={(value) => updateFeedbackStatus(item.id, value)}
                      disabled={updatingId === item.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Notes:</label>
                    <Textarea
                      placeholder="Add internal notes about this feedback..."
                      value={item.admin_notes || ""}
                      onChange={(e) => updateAdminNotes(item.id, e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
