"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Profile } from "@/components/profile-card"

interface IntroRequestModalProps {
    isOpen: boolean
    onClose: () => void
    profile: Profile | null
}

export function IntroRequestModal({ isOpen, onClose, profile }: IntroRequestModalProps) {
    const [message, setMessage] = useState(
        "Hi Shubham, I saw that you know Sarah Chen. I'm looking for advice on scaling engineering teams and would love to chat with her. Could you introduce us?"
    )

    const handleSend = () => {
        // Simulate sending request
        console.log("Sending request:", message)
        onClose()
    }

    if (!profile) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Intro to {profile.name}</DialogTitle>
                    <DialogDescription>
                        Ask Shubham to introduce you. The message is pre-filled based on your search context.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="h-32"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend}>Send Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
