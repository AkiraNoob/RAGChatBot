import { ChatInput } from "@/components/custom/chatinput";
import {
  PreviewMessage,
  ThinkingMessage,
} from "../../components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { useState, useRef } from "react";
import { message } from "../../interfaces/interfaces";
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { v4 as uuidv4 } from "uuid";
import ChatTyping from "@/components/custom/chat-typing";

const socket = new WebSocket("ws://localhost:8000/chat");

export function Chat() {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null
  );

  const cleanupMessageHandler = () => {
    if (messageHandlerRef.current && socket) {
      socket.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  };

  async function handleSubmit(text?: string) {
    console.log("handleSubmit", text, question);
    // if (!socket || socket.readyState !== WebSocket.OPEN || isLoading) return;

    const messageText = text || question;
    setIsLoading(true);
    cleanupMessageHandler();

    const traceId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { content: messageText, role: "user", id: traceId },
    ]);
    setQuestion("");

    const requestPayload = {
      prompt: messageText,
    };

    socket.send(JSON.stringify(requestPayload));

    let fullResponse = "";

    const messageHandler = (event: MessageEvent) => {
      if (event.data === "[END]") {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { content: fullResponse, role: "assistant", id: traceId },
        ]);
        cleanupMessageHandler();
        return;
      }

      try {
        const parsed = JSON.parse(event.data);
        if (parsed.output) {
          fullResponse += parsed.output;
        } else if (parsed.error) {
          console.error("Backend error:", parsed.error);
        }
      } catch {
        // In case the response isn't JSON (fallback)
        fullResponse += event.data;
      }
    };

    messageHandlerRef.current = messageHandler;
    socket.addEventListener("message", messageHandler);
  }

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <Header />
      <div
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        ref={messagesContainerRef}
      >
        {messages.map((message, index) => (
          <PreviewMessage key={index} message={message} />
        ))}
        {isLoading && (
          <ChatTyping className="w-full mx-auto max-w-3xl px-4 group/message" />
        )}
        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
