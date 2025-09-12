"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Brain, Clock, Trophy, CheckCircle, XCircle, ArrowLeft, ArrowRight, AlertTriangle, Shield } from "lucide-react"
import Link from "next/link"

interface SimulationStep {
  action: string
  options: string[]
  correct: number
  explanation?: string
}

interface EmailScenario {
  from: string
  subject: string
  content: string
  isPhishing: boolean
  indicators: string[]
}

interface IncidentScenario {
  type: string
  description: string
  steps: SimulationStep[]
}

interface ScenarioData {
  scenario: string
  emails?: EmailScenario[]
  incident?: IncidentScenario
  steps?: SimulationStep[]
}

interface Simulation {
  id: string
  title: string
  description: string
  scenario_data: string
  estimated_duration: number
  difficulty_level: string
  category: string
}

interface SimulationAttempt {
  id: string
  score: number | null
  completed: boolean
  completed_at: string | null
}

interface SimulationInterfaceProps {
  simulation: Simulation
  userId: string
  previousAttempts: SimulationAttempt[]
}

export function SimulationInterface({ simulation, userId, previousAttempts }: SimulationInterfaceProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [decisions, setDecisions] = useState<Record<number, number>>({})
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{ score: number; correctDecisions: number; feedback: string[] } | null>(null)

  const scenarioData: ScenarioData = JSON.parse(simulation.scenario_data)
  const bestAttempt =
    previousAttempts.length > 0
      ? previousAttempts.reduce((best, current) => ((current.score || 0) > (best.score || 0) ? current : best))
      : null

  // Get steps based on scenario type
  const getSteps = (): SimulationStep[] => {
    if (scenarioData.scenario === "email_inbox" && scenarioData.emails) {
      return scenarioData.emails.map((email) => ({
        action: `Analyze this email from ${email.from}`,
        options: ["This is legitimate", "This is phishing", "Need more information"],
        correct: email.isPhishing ? 1 : 0,
        explanation: email.isPhishing
          ? `This is phishing. Red flags: ${email.indicators.join(", ")}`
          : "This appears to be a legitimate email with no suspicious indicators.",
      }))
    } else if (scenarioData.incident) {
      return scenarioData.incident.steps
    } else if (scenarioData.steps) {
      return scenarioData.steps
    }
    return []
  }

  const steps = getSteps()
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0

  const handleDecisionSelect = (stepIndex: number, optionIndex: number) => {
    setDecisions((prev) => ({
      ...prev,
      [stepIndex]: optionIndex,
    }))
  }

  const handleSubmitSimulation = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setIsCompleted(true)

    // Calculate score and feedback
    let correctCount = 0
    const feedback: string[] = []

    steps.forEach((step, index) => {
      const userDecision = decisions[index]
      const isCorrect = userDecision === step.correct

      if (isCorrect) {
        correctCount++
        feedback.push(`✓ Step ${index + 1}: Correct decision`)
      } else {
        feedback.push(`✗ Step ${index + 1}: ${step.explanation || "Incorrect decision"}`)
      }
    })

    const score = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0

    // Save to database
    const supabase = createClient()
    const { error } = await supabase.from("user_simulation_attempts").insert({
      user_id: userId,
      simulation_id: simulation.id,
      score,
      decisions: JSON.stringify(decisions),
      completed: true,
      completed_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving simulation attempt:", error)
    }

    setResults({ score, correctDecisions: correctCount, feedback })
    setIsSubmitting(false)
  }

  const renderEmailContent = (email: EmailScenario) => (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">From:</span>
            <span>{email.from}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Subject:</span>
            <span>{email.subject}</span>
          </div>
        </div>
      </div>
      <div className="p-4 border rounded-lg">
        <p className="text-pretty leading-relaxed">{email.content}</p>
      </div>
    </div>
  )

  const renderIncidentContent = (step: SimulationStep) => (
    <div className="space-y-4">
      <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-red-800 dark:text-red-200">Security Incident Detected</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1 text-pretty">{step.action}</p>
        </div>
      </div>
    </div>
  )

  if (!isStarted) {
    return (
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/simulations">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Simulations
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-balance">{simulation.title}</CardTitle>
                  <p className="text-muted-foreground text-pretty">{simulation.description}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Simulation Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scenario Type</span>
                      <span className="capitalize">{scenarioData.scenario?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Steps</span>
                      <span>{steps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Time</span>
                      <span>{simulation.estimated_duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant="secondary" className="capitalize">
                        {simulation.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                </div>

                {bestAttempt && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Best Performance</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">{bestAttempt.score || 0}%</span>
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed on{" "}
                        {bestAttempt.completed_at ? new Date(bestAttempt.completed_at).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t">
                <Button size="lg" className="w-full md:w-auto" onClick={() => setIsStarted(true)}>
                  <Brain className="h-4 w-4 mr-2" />
                  Start Simulation
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
                <div
                  className={`p-4 rounded-full ${results.score >= 70 ? "bg-green-100 dark:bg-green-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}
                >
                  {results.score >= 70 ? (
                    <Trophy className="h-12 w-12 text-green-600" />
                  ) : (
                    <Shield className="h-12 w-12 text-orange-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl">{results.score >= 70 ? "Well Done!" : "Good Effort!"}</CardTitle>
              <p className="text-muted-foreground">
                {results.score >= 70
                  ? "You handled the cybersecurity scenario effectively!"
                  : "Keep practicing to improve your incident response skills."}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{results.score}%</p>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    {results.correctDecisions}/{steps.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct Decisions</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{simulation.estimated_duration}</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Performance Review</h3>
                <div className="space-y-3">
                  {results.feedback.map((item, index) => {
                    const isCorrect = item.startsWith("✓")

                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm text-pretty">{item.substring(2)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button variant="outline" asChild>
                  <Link href="/simulations">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Simulations
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(0)
                    setDecisions({})
                    setIsStarted(false)
                    setIsCompleted(false)
                    setResults(null)
                  }}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const currentStepData = steps[currentStep]

  return (
    <main className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-balance">{simulation.title}</h1>
            <p className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{simulation.estimated_duration} min</span>
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

        {/* Scenario Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-balance">{currentStepData?.action}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Render scenario-specific content */}
            {scenarioData.scenario === "email_inbox" &&
              scenarioData.emails &&
              renderEmailContent(scenarioData.emails[currentStep])}

            {scenarioData.scenario === "incident_response" && renderIncidentContent(currentStepData)}

            <Separator />

            {/* Decision Options */}
            <div className="space-y-4">
              <h3 className="font-medium">What would you do?</h3>
              <RadioGroup
                value={decisions[currentStep]?.toString()}
                onValueChange={(value) => handleDecisionSelect(currentStep, Number.parseInt(value))}
              >
                {currentStepData?.options.map((option, index) => (
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
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmitSimulation}
                  disabled={isSubmitting || Object.keys(decisions).length !== steps.length}
                >
                  {isSubmitting ? "Completing..." : "Complete Simulation"}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  disabled={decisions[currentStep] === undefined}
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
