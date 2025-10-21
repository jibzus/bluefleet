"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Link href="/contact" aria-label="Contact support">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </Link>
      {isHovered && (
        <div className="fade-in absolute bottom-16 right-0 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-sm text-background shadow-lg">
          Need help? Chat with us
        </div>
      )}
    </div>
  );
}
