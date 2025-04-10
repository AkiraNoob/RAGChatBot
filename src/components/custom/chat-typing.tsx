import { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";
import style from "./style.module.css";

const ChatTyping = (props: ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      {...props}
      className={twMerge(
        "flex w-fit gap-1 bg-transparent py-[2px]",
        props.className
      )}
    >
      <div
        className={twMerge(
          "h-[6px] w-[6px] rounded-full bg-zinc-700",
          style.chat_typing_circle_1
        )}
      ></div>
      <div
        className={twMerge(
          "h-[6px] w-[6px] rounded-full bg-zinc-700",
          style.chat_typing_circle_2
        )}
      ></div>
      <div
        className={twMerge(
          "h-[6px] w-[6px] rounded-full bg-zinc-700",
          style.chat_typing_circle_3
        )}
      ></div>
    </div>
  );
};

export default ChatTyping;
