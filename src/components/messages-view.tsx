"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, initials } from "@/lib/utils";

interface UserLite {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}
interface Conversation {
  user: UserLite;
  lastMessage: string;
  at: string;
  unread: number;
}
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export function MessagesView({ currentUserId }: { currentUserId: string }) {
  const params = useSearchParams();
  const initialTo = params.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [directory, setDirectory] = useState<UserLite[]>([]);
  const [active, setActive] = useState<UserLite | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (res.ok) setConversations(await res.json());
  }, []);

  useEffect(() => {
    loadConversations();
    fetch("/api/users")
      .then((r) => r.json())
      .then(setDirectory);
  }, [loadConversations]);

  const openThread = useCallback(async (user: UserLite) => {
    setActive(user);
    setLoadingThread(true);
    const res = await fetch(`/api/messages?with=${user.id}`);
    if (res.ok) setMessages(await res.json());
    setLoadingThread(false);
  }, []);

  // Auto-open thread from ?to= once the directory is loaded.
  useEffect(() => {
    if (initialTo && directory.length && !active) {
      const u = directory.find((d) => d.id === initialTo);
      if (u) openThread(u);
    }
  }, [initialTo, directory, active, openThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    setSending(true);
    const content = draft.trim();
    setDraft("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: active.id, content }),
    });
    if (res.ok) {
      await openThread(active);
      await loadConversations();
    }
    setSending(false);
  }

  return (
    <Card className="grid h-[calc(100vh-12rem)] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className={cn("flex flex-col border-r", active && "hidden md:flex")}>
        <div className="border-b p-3">
          <Select
            value=""
            onChange={(e) => {
              const u = directory.find((d) => d.id === e.target.value);
              if (u) openThread(u);
            }}
          >
            <option value="">＋ Start new conversation…</option>
            {directory.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet. Start one above.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user.id}
                onClick={() => openThread(c.user)}
                className={cn(
                  "flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-accent",
                  active?.id === c.user.id && "bg-accent",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials(c.user.name, c.user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.user.name || c.user.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && <Badge>{c.unread}</Badge>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={cn("flex flex-col", !active && "hidden md:flex")}>
        {!active ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a conversation to start chatting.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b p-3">
              <button
                className="text-sm text-muted-foreground md:hidden"
                onClick={() => setActive(null)}
              >
                ←
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials(active.name, active.email)}
              </div>
              <p className="font-medium">{active.name || active.email}</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingThread ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No messages yet. Say hello!
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === currentUserId;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                          mine
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted",
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="flex gap-2 border-t p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
              />
              <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    </Card>
  );
}
