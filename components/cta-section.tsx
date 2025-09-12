import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  const benefits = [
    "Access to 50+ expert-designed modules",
    "Interactive quizzes and assessments",
    "Realistic cybersecurity simulations",
    "Progress tracking and certificates",
    "Community support and networking",
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 border-0 text-white">
          <div className="absolute inset-0 bg-[url('/cybersecurity-network-pattern.jpg')] opacity-10" />

          <CardContent className="relative p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8" />
                  <span className="text-lg font-semibold">Start Your Cybersecurity Journey</span>
                </div>

                <h2 className="text-3xl lg:text-5xl font-bold text-balance leading-tight">
                  Ready to Become a Cybersecurity Expert?
                </h2>

                <p className="text-xl opacity-90 text-pretty leading-relaxed">
                  Join thousands of learners who are building essential cybersecurity skills through our interactive
                  platform. Start your journey today - it's completely free!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8" asChild>
                    <Link href="/auth/sign-up">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 text-lg px-8 bg-transparent"
                    asChild
                  >
                    <Link href="/modules">Browse Modules</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-6">What's included:</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-lg opacity-90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
