"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Target, Trophy, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Question {
  question: string
  options: string[]
  correct: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: string
  time_limit: number
  passing_score: number
  difficulty_level: string
  category: string
}

interface QuizAttempt {
  id: string
  score: number
  passed: boolean
  completed_at: string
}

interface QuizInterfaceProps {
  quiz: Quiz
  userId: string
  previousAttempts: QuizAttempt[]
}

export function QuizInterface({ quiz, userId, previousAttempts }: QuizInterfaceProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60) // Convert to seconds
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{ score: number; passed: boolean; correctAnswers: number[] } | null>(null)

  const questions: Question[] = JSON.parse(quiz.questions).questions || []
  const bestAttempt =
    previousAttempts.length > 0
      ? previousAttempts.reduce((best, current) => (current.score > best.score ? current : best))
      : null

  // Timer effect
  useEffect(() => {
    if (!isStarted || isCompleted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, isCompleted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setIsCompleted(true)

    // Calculate score
    let correctCount = 0
    const correctAnswers: number[] = []

    questions.forEach((question, index) => {
      correctAnswers.push(question.correct)
      if (answers[index] === question.correct) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / questions.length) * 100)
    const passed = score >= quiz.passing_score

    // Save to database
    const supabase = createClient()
    const { error } = await supabase.from("user_quiz_attempts").insert({
      user_id: userId,
      quiz_id: quiz.id,
      score,
      answers: JSON.stringify(answers),
      passed,
    })

    if (error) {
      console.error("Error saving quiz attempt:", error)
    }

    setResults({ score, passed, correctAnswers })
    setIsSubmitting(false)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (!isStarted) {
    return (
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/quizzes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quizzes
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-balance">{quiz.title}</CardTitle>
                  <p className="text-muted-foreground text-pretty">{quiz.description}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Quiz Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Questions</span>
                      <span>{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Limit</span>
                      <span>{quiz.time_limit} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passing Score</span>
                      <span>{quiz.passing_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant="secondary" className="capitalize">
                        {quiz.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                </div>

                {bestAttempt && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Best Score</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">{bestAttempt.score}%</span>
                        {bestAttempt.passed ? (
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <Target className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bestAttempt.passed ? "Passed" : "Not passed"} •{" "}
                        {new Date(bestAttempt.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t">
                <Button size="lg" className="w-full md:w-auto" onClick={() => setIsStarted(true)}>
                  <Target className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (isCompleted && results) {
    return (
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {results.passed ? (
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Trophy className="h-12 w-12 text-green-600" />
                  </div>
                ) : (
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Target className="h-12 w-12 text-red-600" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl">{results.passed ? "Congratulations!" : "Keep Learning!"}</CardTitle>
              <p className="text-muted-foreground">
                {results.passed
                  ? "You passed the quiz! Great job on your cybersecurity knowledge."
                  : "You didn't pass this time, but keep practicing to improve your skills."}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{results.score}%</p>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    {
                      Object.keys(answers).filter(
                        (i) => answers[Number.parseInt(i)] === results.correctAnswers[Number.parseInt(i)],
                      ).length
                    }
                    /{questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{quiz.passing_score}%</p>
                  <p className="text-sm text-muted-foreground">Passing Score</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Review Your Answers</h3>
                <div className="space-y-3">
                  {questions.map((question, index) => {
                    const userAnswer = answers[index]
                    const isCorrect = userAnswer === question.correct

                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="space-y-2 flex-1">
                            <p className="font-medium text-balance">{question.question}</p>
                            <div className="space-y-1 text-sm">
                              <p className="text-green-600">✓ Correct: {question.options[question.correct]}</p>
                              {!isCorrect && userAnswer !== undefined && (
                                <p className="text-red-600">✗ Your answer: {question.options[userAnswer]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button variant="outline" asChild>
                  <Link href="/quizzes">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quizzes
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setCurrentQuestion(0)
                    setAnswers({})
                    setTimeLeft(quiz.time_limit * 60)
                    setIsStarted(false)
                    setIsCompleted(false)
                    setResults(null)
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-balance">{quiz.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 300 ? "text-red-600 font-medium" : ""}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-balance">{questions[currentQuestion]?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswerSelect(currentQuestion, Number.parseInt(value))}
            >
              {questions[currentQuestion]?.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-pretty">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={answers[currentQuestion] === undefined}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
