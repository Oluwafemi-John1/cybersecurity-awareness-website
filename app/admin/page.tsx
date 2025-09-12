import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Target, Brain, TrendingUp, Settings, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get admin statistics
  const { data: users } = await supabase
    .from("profiles")
    .select("id, created_at")
    .order("created_at", { ascending: false })

  const { data: modules } = await supabase.from("modules").select("id, is_published")

  const { data: quizzes } = await supabase.from("quizzes").select("id, is_published")

  const { data: simulations } = await supabase.from("simulations").select("id, is_published")

  const { data: quizAttempts } = await supabase
    .from("user_quiz_attempts")
    .select("id, completed_at")
    .order("completed_at", { ascending: false })
    .limit(10)

  const { data: moduleProgress } = await supabase.from("user_module_progress").select("id, completed")

  // Calculate stats
  const totalUsers = users?.length || 0
  const newUsersThisWeek =
    users?.filter((u) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(u.created_at) > weekAgo
    }).length || 0

  const publishedModules = modules?.filter((m) => m.is_published).length || 0
  const draftModules = modules?.filter((m) => !m.is_published).length || 0

  const publishedQuizzes = quizzes?.filter((q) => q.is_published).length || 0
  const draftQuizzes = quizzes?.filter((q) => !q.is_published).length || 0

  const publishedSimulations = simulations?.filter((s) => s.is_published).length || 0
  const draftSimulations = simulations?.filter((s) => !s.is_published).length || 0

  const completedModules = moduleProgress?.filter((p) => p.completed).length || 0
  const totalQuizAttempts = quizAttempts?.length || 0

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      change: `+${newUsersThisWeek} this week`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Learning Modules",
      value: publishedModules,
      change: `${draftModules} drafts`,
      icon: BookOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Quizzes",
      value: publishedQuizzes,
      change: `${draftQuizzes} drafts`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Simulations",
      value: publishedSimulations,
      change: `${draftSimulations} drafts`,
      icon: Brain,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  const quickActions = [
    {
      title: "Create Module",
      description: "Add a new learning module",
      href: "/admin/modules/create",
      icon: BookOpen,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Create Quiz",
      description: "Design a new quiz",
      href: "/admin/quizzes/create",
      icon: Target,
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      title: "Create Simulation",
      description: "Build a new simulation",
      href: "/admin/simulations/create",
      icon: Brain,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Manage Users",
      description: "View and manage users",
      href: "/admin/users",
      icon: Users,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your Cyberaware platform content and users</p>
              </div>
              <Badge variant="default" className="bg-blue-600">
                Administrator
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <Button key={index} variant="outline" className="h-auto p-4 justify-start bg-transparent" asChild>
                        <Link href={action.href}>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${action.color} text-white`}>
                              <action.icon className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-sm text-muted-foreground">{action.description}</div>
                            </div>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded">
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Module Completions</p>
                            <p className="text-xs text-muted-foreground">
                              {completedModules} modules completed by users
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                            <Target className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Quiz Attempts</p>
                            <p className="text-xs text-muted-foreground">{totalQuizAttempts} recent quiz attempts</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">New Users</p>
                            <p className="text-xs text-muted-foreground">{newUsersThisWeek} new users this week</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Management Links */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/modules">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Modules
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/quizzes">
                      <Target className="mr-2 h-4 w-4" />
                      Manage Quizzes
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/simulations">
                      <Brain className="mr-2 h-4 w-4" />
                      Manage Simulations
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      User Management
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/analytics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
