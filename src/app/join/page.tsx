"use client"

import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, ArrowRight, ShieldCheck } from "lucide-react"

function JoinContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const ref = searchParams.get("ref")
    const hubName = ref === "shubham_s" ? "Shubham" : "Ajay" // Mock logic

    const [isLoading, setIsLoading] = useState(false)

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background/50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Join {hubName}'s Network</h1>
                    <p className="text-muted-foreground">
                        You've been invited to access {hubName}'s trusted network for introductions.
                    </p>
                </div>

                <Card className="border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Create your account</CardTitle>
                        <CardDescription>
                            Sign up to search and request intros.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleJoin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                                    Full Name
                                </label>
                                <Input id="name" placeholder="e.g. Sarah Chen" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="phone">
                                    Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    We never share your number without permission.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    "Connecting..."
                                ) : (
                                    <>
                                        Continue to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    By joining, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <JoinContent />
        </Suspense>
    )
}
