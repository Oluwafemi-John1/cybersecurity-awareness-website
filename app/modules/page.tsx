import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, CheckCircle, Search, Filter, Play, Trophy } from "lucide-react"
import Link from "next/link"

export default async function ModulesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all published modules
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get user's module progress
  const { data: userProgress } = await supabase.from("user_module_progress").select("*").eq("user_id", data.user.id)

  const progressByModule =
    userProgress?.reduce(
      (acc, progress) => {
        acc[progress.module_id] = progress
        return acc
      },
      {} as Record<string, any>,
    ) || {}

  const categories = [...new Set(modules?.map((m) => m.category) || [])]
  const difficultyLevels = ["beginner", "intermediate", "advanced"]

  // Calculate stats
  const completedModules = userProgress?.filter((p) => p.completed).length || 0
  const totalProgress =
    userProgress?.length > 0
      ? Math.round(userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / userProgress.length)
      : 0

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Learning Modules</h1>
            </div>
            <p className="text-muted-foreground text-pretty">
              Master cybersecurity concepts through our comprehensive learning modules. Each module is designed by
              experts to build your knowledge step by step.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Modules</p>
                    <p className="text-2xl font-bold">{modules?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedModules}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold">{totalProgress}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search modules..." className="pl-10" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    All Categories
                  </Button>
                  <Button variant="outline" size="sm">
                    All Levels
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules?.map((module) => {
              const userModuleProgress = progressByModule[module.id]
              const content = JSON.parse(module.content)
              const sectionCount = content.sections?.length || 0

              return (
                <Card key={module.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-balance leading-tight">{module.title}</CardTitle>
                        <p className="text-sm text-muted-foreground text-pretty">{module.description}</p>
                      </div>
                      {userModuleProgress?.completed && (
                        <div className="flex flex-col items-end space-y-1">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <Badge variant="default" className="text-xs">
                            Completed
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {module.difficulty_level}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {module.estimated_duration} min
                        </div>
                      </div>
                      <span className="text-muted-foreground">{sectionCount} sections</span>
                    </div>

                    {userModuleProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{userModuleProgress.progress_percentage}%</span>
                        </div>
                        <Progress value={userModuleProgress.progress_percentage} className="h-2" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Category</span>
                        <span className="capitalize">{module.category.replace("-", " ")}</span>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/modules/${module.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        {userModuleProgress?.completed
                          ? "Review Module"
                          : userModuleProgress
                            ? "Continue Learning"
                            : "Start Module"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {(!modules || modules.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No modules available</h3>
                <p className="text-muted-foreground">Check back later for new cybersecurity learning modules.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
