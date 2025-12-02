"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2, Settings, Sparkles } from "lucide-react"
import { TokenDialog } from "./token-dialog"
import { ModelSelector } from "./model-selector"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function PuterChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [showTokenDialog, setShowTokenDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem("puter-auth-token")
    if (savedToken) {
      setAuthToken(savedToken)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSaveToken = (token: string) => {
    setAuthToken(token)
    localStorage.setItem("puter-auth-token", token)
    setShowTokenDialog(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    if (!authToken) {
      setShowTokenDialog(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("https://api.puter.com/drivers/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          interface: "puter-chat-completion",
          driver: "openai-completion",
          method: "complete",
          args: {
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: "user", content: input.trim() },
            ],
            model: selectedModel,
          },
        }),
      })

      const data = await response.json()

      if (data.success === false || data.error) {
        throw new Error(data.error?.message || "Failed to get response")
      }

      const assistantContent =
        data.result?.message?.content ||
        data.message?.content ||
        data.result?.choices?.[0]?.message?.content ||
        "No response received"

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to send message. Please check your auth token."}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Puter AI Chat</h1>
            <p className="text-sm text-muted-foreground">Powered by Puter API</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <Button variant="outline" size="icon" onClick={() => setShowTokenDialog(true)} title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Start a conversation</h2>
            <p className="text-muted-foreground max-w-md">
              {authToken
                ? "Type a message below to start chatting with AI."
                : "Configure your Puter auth token to begin chatting."}
            </p>
            {!authToken && (
              <Button className="mt-4" onClick={() => setShowTokenDialog(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Set Auth Token
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <Card
                  className={`max-w-[80%] px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
                {message.role === "user" && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <Card className="bg-muted px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </Card>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Using {selectedModel} via Puter API</p>
      </div>

      {/* Token Dialog */}
      <TokenDialog
        open={showTokenDialog}
        onOpenChange={setShowTokenDialog}
        currentToken={authToken}
        onSave={handleSaveToken}
      />
    </div>
  )
}
