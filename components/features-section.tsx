import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, Brain, Users, Award, TrendingUp } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Learning Modules",
      description:
        "Master cybersecurity fundamentals through structured, expert-designed learning paths covering everything from basic concepts to advanced threat detection.",
      badge: "50+ Modules",
      color: "bg-blue-500",
    },
    {
      icon: Target,
      title: "Interactive Quizzes & Assessments",
      description:
        "Test your knowledge with challenging quizzes that adapt to your skill level and provide instant feedback to accelerate your learning.",
      badge: "Adaptive Learning",
      color: "bg-emerald-500",
    },
    {
      icon: Brain,
      title: "Realistic Cyber Simulations",
      description:
        "Practice incident response, threat hunting, and security analysis in safe, simulated environments that mirror real-world scenarios.",
      badge: "Hands-on Practice",
      color: "bg-purple-500",
    },
    {
      icon: Users,
      title: "Community & Collaboration",
      description:
        "Connect with fellow cybersecurity enthusiasts, share insights, and learn from a global community of security professionals.",
      badge: "10k+ Members",
      color: "bg-cyan-500",
    },
    {
      icon: Award,
      title: "Skill Certification",
      description:
        "Earn recognized certificates as you complete modules and demonstrate mastery of cybersecurity concepts and practices.",
      badge: "Industry Recognized",
      color: "bg-orange-500",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed analytics, skill assessments, and personalized recommendations for continued growth.",
      badge: "AI-Powered",
      color: "bg-pink-500",
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-balance">
            Everything You Need to Excel in <span className="text-blue-600 dark:text-blue-400">Cybersecurity</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Our comprehensive platform combines theoretical knowledge with practical experience to prepare you for
            real-world cybersecurity challenges.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-balance">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-pretty">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
