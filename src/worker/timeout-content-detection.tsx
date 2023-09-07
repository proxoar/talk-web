import React, {useEffect} from "react";
import {errorIfTimeout} from "../data-structure/message.tsx";
import {useChatStore} from "../state/convs.tsx";

// if content stays at 'sending' or 'receiving' status for over contentTimeoutSeconds, mark it as timeout
export const TimeoutContentDetection: React.FC = () => {

    const updateMessage = useChatStore((state) => (state.updateMessage))

    useEffect(() => {
        const interval = setInterval(() => {
            const state = useChatStore.getState();
            // for better performance, only check last 60 qa
            for (const [chatId, chat] of Object.entries(state.cs)) {
                for (const m of chat.ms.slice(-60)) {
                    const [now, timeout] = errorIfTimeout(m)
                    if (timeout) {
                        updateMessage(chatId, now)
                    }
                }
            }
        }, 2000);

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        };
    }, [updateMessage]);
    return null
}



