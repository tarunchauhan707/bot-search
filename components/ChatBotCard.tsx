"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatBotCard({ name, response }: { name: string, response: string }) {
  return (
    <Card className="rounded-2xl shadow p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <CardContent className="whitespace-pre-wrap text-sm">
        {response || "⏳ Loading..."}
      </CardContent>
    </Card>
  );
}
