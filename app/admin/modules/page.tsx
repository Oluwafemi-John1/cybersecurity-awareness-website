import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Filter, ArrowLeft, Plus, Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

export default async function AdminModulesPage() {
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

  // Get all modules
  const { data: modules } = await supabase.from("modules").select("*").order("created_at", { ascending: false })

  const publishedCount = modules?.filter((m) => m.is_published).length || 0
  const draftCount = modules?.filter((m) => !m.is_published).length || 0

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <h1 className="text-3xl font-bold">Module Management</h1>
                </div>
                <p className="text-muted-foreground">Create and manage learning modules for the platform</p>
              </div>
              <Button asChild>
                <Link href="/admin/modules/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold">{publishedCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                    <p className="text-2xl font-bold">{draftCount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Edit className="h-6 w-6 text-orange-600" />
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
                    All Status
                  </Button>
                  <Button variant="outline" size="sm">
                    All Categories
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules List */}
          <Card>
            <CardHeader>
              <CardTitle>All Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules?.map((module) => {
                  const content = JSON.parse(module.content)
                  const sectionCount = content.sections?.length || 0

                  return (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-balance">{module.title}</h3>
                          <Badge variant={module.is_published ? "default" : "secondary"}>
                            {module.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">
                            {module.difficulty_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground text-pretty">{module.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{sectionCount} sections</span>
                          <span>•</span>
                          <span>{module.estimated_duration} minutes</span>
                          <span>•</span>
                          <span className="capitalize">{module.category.replace("-", " ")}</span>
                          <span>•</span>
                          <span>Created {new Date(module.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/modules/${module.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {(!modules || modules.length === 0) && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No modules found</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first learning module.</p>
                  <Button asChild>
                    <Link href="/admin/modules/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Module
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
