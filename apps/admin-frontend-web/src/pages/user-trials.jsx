import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  User,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  Download,
} from "lucide-react";

const UserTrialsAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTrials, setUserTrials] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all users with quiz activity
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users/quiz-activity");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trials for a specific user
  const fetchUserTrials = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/trials`);
      if (response.ok) {
        const data = await response.json();
        setUserTrials(data.trials);
      } else {
        console.error("Failed to fetch user trials");
      }
    } catch (error) {
      console.error("Error fetching user trials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats for a specific user
  const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats);
      } else {
        console.error("Failed to fetch user stats");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserTrials(user.id);
    fetchUserStats(user.id);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter trials based on date
  const filteredTrials = userTrials.filter((trial) => {
    if (!filterDate) return true;
    const trialDate = new Date(trial.createdAt).toISOString().split("T")[0];
    return trialDate === filterDate;
  });

  // Calculate trial statistics
  const getTrialStats = (trials) => {
    if (!trials.length) return null;

    const total = trials.length;
    const correct = trials.filter((t) => t.isCorrect).length;
    const accuracy = Math.round((correct / total) * 100);

    const byContrast = trials.reduce((acc, trial) => {
      const contrast = trial.contrastName || "Unknown";
      if (!acc[contrast]) {
        acc[contrast] = { total: 0, correct: 0 };
      }
      acc[contrast].total++;
      if (trial.isCorrect) acc[contrast].correct++;
      return acc;
    }, {});

    const byDate = trials.reduce((acc, trial) => {
      const date = new Date(trial.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { total: 0, correct: 0 };
      }
      acc[date].total++;
      if (trial.isCorrect) acc[date].correct++;
      return acc;
    }, {});

    return { total, correct, accuracy, byContrast, byDate };
  };

  const trialStats = getTrialStats(filteredTrials);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get performance color
  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Trials Admin</h1>
        <Button variant="outline" onClick={fetchUsers}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Users
            </CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.name || "No name"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.trialCount || 0} trials • Last active:{" "}
                        {user.lastActive
                          ? formatDate(user.lastActive)
                          : "Never"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUser ? (
                <div className="flex items-center justify-between">
                  <span>{selectedUser.email}</span>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                </div>
              ) : (
                "Select a user to view details"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trials">Trials</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {trialStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Overall Accuracy
                            </span>
                          </div>
                          <div
                            className={`text-2xl font-bold ${getPerformanceColor(
                              trialStats.accuracy
                            )}`}
                          >
                            {trialStats.accuracy}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {trialStats.correct} correct out of{" "}
                            {trialStats.total} trials
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Total Trials
                            </span>
                          </div>
                          <div className="text-2xl font-bold">
                            {trialStats.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Across all contrasts
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Active Days
                            </span>
                          </div>
                          <div className="text-2xl font-bold">
                            {Object.keys(trialStats.byDate).length}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Days with quiz activity
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {trialStats?.byContrast && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Performance by Contrast
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(trialStats.byContrast)
                            .sort(([, a], [, b]) => b.total - a.total)
                            .map(([contrast, stats]) => {
                              const accuracy = Math.round(
                                (stats.correct / stats.total) * 100
                              );
                              return (
                                <div
                                  key={contrast}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {contrast}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {stats.correct}/{stats.total} correct
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      accuracy >= 80
                                        ? "default"
                                        : accuracy >= 60
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {accuracy}%
                                  </Badge>
                                </div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="trials" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Trials</h3>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {filteredTrials.map((trial) => (
                        <div key={trial.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {trial.contrastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {trial.wordA} vs {trial.wordB}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Presented: {trial.presentedSide} • Chose:{" "}
                                {trial.choiceSide}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">
                                {formatDate(trial.createdAt)}
                              </div>
                              {trial.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  {userStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Quiz Completion
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Vowels</span>
                              <span>
                                {userStats.vowels?.completed || 0}/
                                {userStats.vowels?.total || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Consonants</span>
                              <span>
                                {userStats.consonants?.completed || 0}/
                                {userStats.consonants?.total || 0}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Total</span>
                              <span>
                                {userStats.overall?.completed || 0}/
                                {userStats.overall?.total || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Average Scores
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Vowels</span>
                              <span
                                className={getPerformanceColor(
                                  userStats.vowels?.average || 0
                                )}
                              >
                                {userStats.vowels?.average || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Consonants</span>
                              <span
                                className={getPerformanceColor(
                                  userStats.consonants?.average || 0
                                )}
                              >
                                {userStats.consonants?.average || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Overall</span>
                              <span
                                className={getPerformanceColor(
                                  userStats.overall?.average || 0
                                )}
                              >
                                {userStats.overall?.average || 0}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a user from the list to view their quiz data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserTrialsAdmin;
