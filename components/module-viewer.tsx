"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Clock, CheckCircle, ArrowLeft, ArrowRight, Trophy, Play } from "lucide-react"
import Link from "next/link"

interface ModuleSection {
  title: string
  content: string
}

interface ModuleContent {
  sections: ModuleSection[]
}

interface Module {
  id: string
  title: string
  description: string
  content: string
  estimated_duration: number
  difficulty_level: string
  category: string
}

interface ModuleProgress {
  id?: string
  progress_percentage: number
  completed: boolean
}

interface ModuleViewerProps {
  module: Module
  userId: string
  initialProgress: ModuleProgress | null
}

export function ModuleViewer({ module, userId, initialProgress }: ModuleViewerProps) {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [progress, setProgress] = useState<ModuleProgress>(
    initialProgress || { progress_percentage: 0, completed: false },
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const content: ModuleContent = JSON.parse(module.content)
  const sections = content.sections || []
  const progressPercentage = sections.length > 0 ? ((currentSection + 1) / sections.length) * 100 : 0

  // Update progress in database
  const updateProgress = async (newProgress: number, completed = false) => {
    if (isUpdating) return

    setIsUpdating(true)
    const supabase = createClient()

    const progressData = {
      user_id: userId,
      module_id: module.id,
      progress_percentage: Math.round(newProgress),
      completed,
      ...(completed && { completed_at: new Date().toISOString() }),
    }

    if (progress.id) {
      // Update existing progress
      const { error } = await supabase.from("user_module_progress").update(progressData).eq("id", progress.id)
    } else {
      // Create new progress record
      const { data, error } = await supabase.from("user_module_progress").insert(progressData).select().single()

      if (data) {
        setProgress((prev) => ({ ...prev, id: data.id }))
      }
    }

    setProgress((prev) => ({
      ...prev,
      progress_percentage: Math.round(newProgress),
      completed,
    }))

    setIsUpdating(false)
  }

  // Update progress when section changes
  useEffect(() => {
    const newProgress = Math.max(progressPercentage, progress.progress_percentage)
    const isCompleted = currentSection === sections.length - 1 && newProgress >= 100

    if (newProgress > progress.progress_percentage || (isCompleted && !progress.completed)) {
      updateProgress(newProgress, isCompleted)
    }
  }, [currentSection, sections.length])

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1)
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1)
    }
  }

  const handleCompleteModule = () => {
    updateProgress(100, true)
  }

  return (
    <main className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/modules">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                </div>
                <CardTitle className="text-lg text-balance">{module.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{module.estimated_duration} min</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.progress_percentage}%</span>
                  </div>
                  <Progress value={progress.progress_percentage} className="h-2" />
                  {progress.completed && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span>Module Completed!</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Table of Contents</h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-1">
                      {sections.map((section, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSection(index)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            currentSection === index
                              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {index < currentSection || progress.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : index === currentSection ? (
                              <Play className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-pretty">{section.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Badge variant="secondary" className="capitalize">
                    {module.difficulty_level}
                  </Badge>
                  <p className="text-xs text-muted-foreground capitalize">{module.category.replace("-", " ")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-balance">{sections[currentSection]?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Section {currentSection + 1} of {sections.length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div
                    className="text-pretty leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sections[currentSection]?.content?.replace(/\n/g, "<br />") || "",
                    }}
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={handlePreviousSection} disabled={currentSection === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {currentSection + 1} / {sections.length}
                  </div>

                  {currentSection === sections.length - 1 ? (
                    <Button
                      onClick={handleCompleteModule}
                      disabled={progress.completed}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {progress.completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Complete Module
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleNextSection}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Content */}
            {currentSection === sections.length - 1 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Great job completing this module! Here are some suggestions for continuing your cybersecurity
                    learning journey:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent" asChild>
                      <Link href="/quizzes">
                        <div className="text-left">
                          <div className="font-medium">Test Your Knowledge</div>
                          <div className="text-sm text-muted-foreground">Take related quizzes</div>
                        </div>
                      </Link>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent" asChild>
                      <Link href="/modules">
                        <div className="text-left">
                          <div className="font-medium">More Modules</div>
                          <div className="text-sm text-muted-foreground">Continue learning</div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
