"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Trophy,
  Target,
  Calendar,
  Award,
  Star,
  Flame,
  BookOpen,
  Mic,
  PenTool,
  Users,
  Crown,
  Medal,
  Share,
} from "lucide-react";

const achievements = [
  {
    id: 1,
    title: "Grammar Master",
    description: "Complete all advanced grammar lessons",
    icon: PenTool,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    progress: 100,
    unlocked: true,
    points: 500,
    unlockedDate: "2 days ago",
  },
  {
    id: 2,
    title: "Vocabulary Wizard",
    description: "Learn 1000+ new words",
    icon: BookOpen,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    progress: 100,
    unlocked: true,
    points: 750,
    unlockedDate: "1 week ago",
  },
  {
    id: 3,
    title: "Speaking Star",
    description: "Complete 50 speaking exercises",
    icon: Mic,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    progress: 86,
    unlocked: false,
    points: 600,
    current: 43,
    target: 50,
  },
  {
    id: 4,
    title: "Community Helper",
    description: "Help 25 community members",
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    progress: 64,
    unlocked: false,
    points: 400,
    current: 16,
    target: 25,
  },
  {
    id: 5,
    title: "Streak Legend",
    description: "Maintain a 30-day learning streak",
    icon: Flame,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    progress: 23,
    unlocked: false,
    points: 800,
    current: 7,
    target: 30,
  },
  {
    id: 6,
    title: "Perfect Score",
    description: "Score 100% on 10 quizzes",
    icon: Target,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    progress: 70,
    unlocked: false,
    points: 300,
    current: 7,
    target: 10,
  },
];

const badges = [
  {
    title: "Early Bird",
    description: "Study before 8 AM for 7 days",
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    earned: true,
  },
  {
    title: "Night Owl",
    description: "Study after 10 PM for 5 days",
    icon: Medal,
    color: "text-purple-600 dark:text-purple-400",
    earned: true,
  },
  {
    title: "Speed Learner",
    description: "Complete lessons in record time",
    icon: Star,
    color: "text-blue-600 dark:text-blue-400",
    earned: false,
  },
  {
    title: "Social Butterfly",
    description: "Make 10 friends in the community",
    icon: Users,
    color: "text-pink-600 dark:text-pink-400",
    earned: false,
  },
];

const goals = [
  {
    title: "Daily Learning",
    description: "Study for at least 30 minutes daily",
    icon: Calendar,
    progress: 7,
    target: 30,
    streak: 7,
    type: "daily",
  },
  {
    title: "Weekly Vocabulary",
    description: "Learn 50 new words this week",
    icon: BookOpen,
    progress: 32,
    target: 50,
    type: "weekly",
  },
  {
    title: "Monthly Speaking",
    description: "Complete 20 speaking exercises this month",
    icon: Mic,
    progress: 12,
    target: 20,
    type: "monthly",
  },
];

export default function AchievementsView() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Achievements & Goals
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your progress and celebrate your success
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/10 dark:to-green-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-emerald-600">3,450</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Trophy className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/10 dark:to-green-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-3xl font-bold text-emerald-600">12/18</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">7 days</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/10 dark:to-violet-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Global Rank</p>
                <p className="text-3xl font-bold text-purple-600">#1,247</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Card
                  key={achievement.id}
                  className={`hover:shadow-xl transition-all duration-300 flex flex-col ${
                    achievement.unlocked
                      ? "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20"
                      : "hover:border-primary"
                  }`}
                >
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${
                          achievement.unlocked
                            ? achievement.bgColor
                            : "bg-gray-100 dark:bg-gray-800/50"
                        }`}
                      >
                        <IconComponent
                          className={`w-7 h-7 ${
                            achievement.unlocked
                              ? achievement.color
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                      </div>
                      {achievement.unlocked && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                          +{achievement.points} pts
                        </Badge>
                      )}
                    </div>

                    <h3
                      className={`font-bold text-lg mb-2 ${
                        achievement.unlocked
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-foreground"
                      }`}
                    >
                      {achievement.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {achievement.description}
                    </p>

                    <div className="mt-auto">
                      {achievement.unlocked ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              Unlocked!
                            </span>
                            <span className="text-muted-foreground">
                              {achievement.unlockedDate}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          >
                            <Share className="w-4 h-4 mr-2" />
                            Share Achievement
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">
                              {achievement.current}/{achievement.target}
                            </span>
                            <span className="font-bold text-primary">
                              {achievement.progress}%
                            </span>
                          </div>
                          <Progress
                            value={achievement.progress}
                            className="h-3"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const IconComponent = goal.icon;
              const progressPercentage = (goal.progress / goal.target) * 100;

              return (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all hover:border-primary flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl">
                        <IconComponent className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold">{goal.title}</div>
                        <div className="text-sm font-normal text-muted-foreground mt-1">
                          {goal.description}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium">
                          Progress: {goal.progress}/{goal.target}
                        </span>
                        <span className="font-bold text-lg text-primary">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />

                      {goal.streak && (
                        <div className="flex items-center gap-2 text-sm bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                          <Flame className="h-5 w-5 text-orange-600" />
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {goal.streak} day streak! 🔥
                          </span>
                        </div>
                      )}

                      <Badge
                        variant="outline"
                        className="capitalize font-medium border-primary text-primary"
                      >
                        {goal.type} Goal
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Set New Goal */}
          <Card className="border-dashed border-2 border-primary/50 hover:border-primary hover:bg-accent/50 transition-all min-h-[280px] flex items-center justify-center">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 w-fit mx-auto rounded-full mb-4">
                <Target className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">Set a New Goal</h3>
              <p className="text-muted-foreground mb-4">
                Challenge yourself with a custom learning goal
              </p>
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                <Target className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <Card
                  key={index}
                  className={`text-center hover:shadow-xl transition-all duration-300 ${
                    badge.earned
                      ? "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20"
                      : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                        badge.earned
                          ? "bg-amber-100 dark:bg-amber-900/40"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <IconComponent
                        className={`w-10 h-10 ${
                          badge.earned ? badge.color : "text-gray-400"
                        }`}
                      />
                    </div>

                    <h3
                      className={`font-bold text-lg mb-2 ${
                        badge.earned
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-gray-500"
                      }`}
                    >
                      {badge.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </p>

                    {badge.earned && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                        ✓ Earned
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Challenge Section */}
          <Card className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white border-0 overflow-hidden relative">
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <h3 className="font-bold text-2xl mb-3 flex items-center gap-2">
                    <Award className="h-7 w-7" />
                    Weekly Challenge
                  </h3>
                  <p className="text-sm opacity-95 mb-4 text-white/90">
                    Complete 5 lessons this week to earn the &quot;Consistent
                    Learner&quot; badge
                  </p>
                  <div className="flex items-center gap-3 text-sm bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                    <span className="font-semibold">Progress: 3/5 lessons</span>
                    <div className="flex-1 bg-white/30 rounded-full h-3 max-w-[150px]">
                      <div
                        className="bg-white h-3 rounded-full shadow-lg transition-all duration-500"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <span className="font-bold">60%</span>
                  </div>
                </div>
                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-full">
                  <Award className="h-20 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
