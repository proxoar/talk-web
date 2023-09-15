import React, {useEffect} from "react";
import {useSnapshot} from "valtio/react";
import {snapshot} from "valtio";
import {AxiosError} from "axios";
import {controlState} from "../state/control-state.ts";
import {findChatProxy, findMessage} from "../state/app-state.ts";
import {historyMessages} from "../api/restful/util.ts";
import {newSending, onAudio, onError, onSent} from "../data-structure/message.tsx";
import {postAudioChat, postChat} from "../api/restful/api.ts";
import {generateUudioId, randomHash16Char} from "../util/util.tsx";
import {audioDb} from "../state/db.ts";
import {LLMMessage} from "../shared-types.ts";
import {minSpeakTimeMillis} from "../config.ts";
import {toRestfulAPIOption} from "../data-structure/client-option.tsx";

const systemMessage: LLMMessage = {
    role: "system",
    content: "You are a helpful assistant!"
}

export const SubscribeSendingMessage: React.FC = () => {

    const controlSnp = useSnapshot(controlState)
    useEffect(() => {
        if (controlState.sendingMessages.length === 0) {
            return;
        }
        const [sm] = controlState.sendingMessages.splice(0, 1)
        if (!sm) {
            return
        }
        controlState.sendingMessageSignal++

        if (sm.audioBlob) {
            if (sm.durationMs! < minSpeakTimeMillis) {
                console.info("audio is less than ms", minSpeakTimeMillis)
                return
            }
        }

        const chatProxy = findChatProxy(sm.chatId)?.[0]
        if (!chatProxy) {
            console.warn("chat does exist any more, chatId:", sm.chatId)
            return
        }

        const option = snapshot(chatProxy.option)

        let messages = historyMessages(chatProxy, option.llm.maxHistory)
        messages = [systemMessage, ...messages]

        const nonProxyMessage = newSending()
        const talkOption = toRestfulAPIOption(option)
        let postPromise
        if (sm.audioBlob) {
            console.debug("sending audio and chat: ", nonProxyMessage)
            nonProxyMessage.audio = {id: ""}
            chatProxy.messages.push(nonProxyMessage)

            postPromise = postAudioChat(sm.audioBlob as Blob, controlSnp.recordingMimeType?.fileName ?? "audio.webm", {
                chatId: chatProxy.id,
                ticketId: randomHash16Char(),
                ms: messages,
                talkOption: talkOption
            });
        } else {
            messages.push({role: "user", content: sm.text})
            console.debug("sending chat: ", messages)
            chatProxy.messages.push(nonProxyMessage)
            postPromise = postChat({
                chatId: chatProxy.id,
                ticketId: randomHash16Char(),
                ms: messages,
                talkOption: talkOption
            });
        }

        postPromise.then((r) => {
                const msg = findMessage(chatProxy, nonProxyMessage.id);
                if (!msg) {
                    console.error("message not found after pushing, chatId,messageId:", chatProxy.id, nonProxyMessage.id)
                    return
                }
                if (r.status >= 200 && r.status < 300) {
                    onSent(nonProxyMessage)
                } else {
                    onError(nonProxyMessage, "Failed to send, reason:" + r.statusText)
                }
            }
        ).catch((e: AxiosError) => {
            onError(nonProxyMessage, "Failed to send, reason:" + e.message)
        })

        if (sm.audioBlob) {
            const audioId = generateUudioId("recording")
            audioDb.setItem<Blob>(audioId, sm.audioBlob as Blob, (err, value) => {
                    if (err || !value) {
                        console.debug("failed to save audio blob, audioId:", audioId, err)
                    } else {
                        const msg = findMessage(chatProxy, nonProxyMessage.id);
                        if (!msg) {
                            console.error("message not found after pushing, chatId,messageId:", chatProxy.id, nonProxyMessage.id)
                            return
                        }
                        onAudio(msg, {id: audioId, durationMs: sm.durationMs})
                        console.debug("saved audio blob, audioId:", audioId)
                    }
                }
            )
        }
    }, [controlSnp.recordingMimeType?.fileName, controlSnp.sendingMessageSignal]);
    return null
}
