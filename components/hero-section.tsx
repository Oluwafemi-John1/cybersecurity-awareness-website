import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Target, Brain, BookOpen, Users, Award } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const stats = [
    { icon: Users, label: "Active Learners", value: "10,000+" },
    { icon: BookOpen, label: "Learning Modules", value: "50+" },
    { icon: Award, label: "Completion Rate", value: "94%" },
  ]

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/20" />
      <div className="absolute inset-0 bg-[url('/subtle-tech-pattern.jpg')] opacity-5" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                Cybersecurity Education Platform
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Master <span className="text-blue-600 dark:text-blue-400">Cybersecurity</span> Through Interactive
                Learning
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Build essential cybersecurity skills with hands-on modules, challenging quizzes, and realistic
                simulations. Protect yourself and your organization in the digital age.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/auth/sign-up">Start Learning Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                <Link href="/modules">Explore Modules</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Interactive Quizzes</h3>
                  <p className="text-sm opacity-90">Test your knowledge with engaging cybersecurity challenges</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 mt-8">
                <CardContent className="p-6">
                  <Brain className="h-8 w-8 mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Real Simulations</h3>
                  <p className="text-sm opacity-90">Practice with realistic cybersecurity scenarios</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 -mt-4">
                <CardContent className="p-6">
                  <BookOpen className="h-8 w-8 mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Expert Modules</h3>
                  <p className="text-sm opacity-90">Learn from industry-leading cybersecurity experts</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 mt-4">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Practical Skills</h3>
                  <p className="text-sm opacity-90">Build real-world cybersecurity competencies</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
