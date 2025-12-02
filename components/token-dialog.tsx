"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ExternalLink } from "lucide-react"

interface TokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentToken: string
  onSave: (token: string) => void
}

export function TokenDialog({ open, onOpenChange, currentToken, onSave }: TokenDialogProps) {
  const [token, setToken] = useState(currentToken)
  const [showToken, setShowToken] = useState(false)

  const handleSave = () => {
    onSave(token)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Puter Auth Token</DialogTitle>
          <DialogDescription>Enter your Puter authentication token to use the AI chat API.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Auth Token</Label>
            <div className="relative">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your Puter auth token"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium text-foreground mb-2">How to get your token:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Go to{" "}
                <a
                  href="https://puter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  puter.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Sign in or create an account</li>
              <li>Open browser DevTools (F12)</li>
              <li>
                In Console, type: <code className="bg-background px-1 rounded">puter.authToken</code>
              </li>
              <li>Copy the token value</li>
            </ol>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!token.trim()}>
            Save Token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
