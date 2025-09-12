import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Target, Clock, Trophy, Search, Filter, Play } from "lucide-react"
import Link from "next/link"

export default async function QuizzesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all published quizzes
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get user's quiz attempts
  const { data: userAttempts } = await supabase
    .from("user_quiz_attempts")
    .select("quiz_id, score, passed, completed_at")
    .eq("user_id", data.user.id)

  const attemptsByQuiz =
    userAttempts?.reduce(
      (acc, attempt) => {
        if (!acc[attempt.quiz_id] || new Date(attempt.completed_at) > new Date(acc[attempt.quiz_id].completed_at)) {
          acc[attempt.quiz_id] = attempt
        }
        return acc
      },
      {} as Record<string, any>,
    ) || {}

  const categories = [...new Set(quizzes?.map((q) => q.category) || [])]
  const difficultyLevels = ["beginner", "intermediate", "advanced"]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Cybersecurity Quizzes</h1>
            </div>
            <p className="text-muted-foreground text-pretty">
              Test your cybersecurity knowledge with our interactive quizzes. Track your progress and identify areas for
              improvement.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Quizzes</p>
                    <p className="text-2xl font-bold">{quizzes?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Quizzes Completed</p>
                    <p className="text-2xl font-bold">{Object.keys(attemptsByQuiz).length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {userAttempts?.length
                        ? Math.round(userAttempts.reduce((sum, a) => sum + a.score, 0) / userAttempts.length)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Target className="h-6 w-6 text-purple-600" />
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
                    <Input placeholder="Search quizzes..." className="pl-10" />
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

          {/* Quiz Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes?.map((quiz) => {
              const userAttempt = attemptsByQuiz[quiz.id]
              const questions = JSON.parse(quiz.questions)

              return (
                <Card key={quiz.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-balance leading-tight">{quiz.title}</CardTitle>
                        <p className="text-sm text-muted-foreground text-pretty">{quiz.description}</p>
                      </div>
                      {userAttempt && (
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={userAttempt.passed ? "default" : "destructive"} className="text-xs">
                            {userAttempt.score}%
                          </Badge>
                          {userAttempt.passed && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="text-xs">
                          {quiz.difficulty_level}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {quiz.time_limit} min
                        </div>
                      </div>
                      <span className="text-muted-foreground">{questions.questions?.length || 0} questions</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Passing Score</span>
                        <span>{quiz.passing_score}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Category</span>
                        <span className="capitalize">{quiz.category.replace("-", " ")}</span>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        {userAttempt ? "Retake Quiz" : "Start Quiz"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {(!quizzes || quizzes.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No quizzes available</h3>
                <p className="text-muted-foreground">
                  Check back later for new cybersecurity quizzes to test your knowledge.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
