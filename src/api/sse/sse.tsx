import {useEffect} from 'react';
import {fetchEventSource} from '@microsoft/fetch-event-source';
import {useSnapshot} from "valtio/react";
import {snapshot} from "valtio";
import {networkState} from "../../state/network-state.ts";
import {appState, Chat, findMessage} from "../../state/app-state.ts";
import {ServerAbility} from "./server-ability.ts";
import {newThinking, onAudio, onEOF, onError, onTyping} from "../../state/data-structure/message.tsx";
import {
    EventMessageAudio, EventMessageError,
    EventMessageTextEOF,
    EventMessageTextTyping,
    EventMessageThinking,
    EventSystemAbility, SSEMsgAudio, SSEMsgError,
    SSEMsgMeta,
    SSEMsgText
} from "./event.ts";
import {ClientAbility, mergeAbility} from "../../state/data-structure/client-ability/client-ability.tsx";
import {base64ToBlob, formatNow, randomHash16Char} from "../../util/util.tsx";
import {audioDb} from "../../state/db.ts";
import {audioPlayerMimeType, SSEEndpoint} from "../../config.ts";

export const SSE = () => {
    const networkSnp = useSnapshot(networkState)
    const authSnp = useSnapshot(appState.auth)

    useEffect(() => {
        const ep = SSEEndpoint()
        const url = ep + "?stream=" + networkSnp.streamId

        console.info("connecting to SSE: ", url);
        const ctrl = new AbortController();
        fetchEventSource(url, {
            signal: ctrl.signal,
            headers: {
                'Authorization': 'Bearer ' + authSnp.passwordHash,
            },
            keepalive: true,
            onopen: async (response: Response) => {
                console.info("EventSource connected to server, response: ", response);
            },
            onmessage: (msg) => {
                console.debug("received an msg from SSE server", msg.event, msg.data.slice(0, 500))
                const data = JSON.parse(msg.data)
                if (msg.event === EventSystemAbility) {
                    const sa = data as ServerAbility
                    // important! todo rewrite merge logics using by simply updating appState.ability
                    appState.ability = mergeAbility(snapshot(appState.ability) as ClientAbility, sa)
                    return;
                }

                // the following event are all related to chat
                const chatId = (data as SSEMsgMeta).chatId!
                const chatProxy = appState.chats[chatId] as Chat | undefined
                if (!chatProxy) {
                    console.warn("received an event from server, but can't find a chat to deal with, " +
                        "this usually happens when a chat has been deleted, or this would be fatal err that requires " +
                        "our developers to re-check the code. chatId:", chatId)
                    return
                }
                const meta: SSEMsgMeta = data
                if (msg.event === EventMessageThinking) {
                    const message = newThinking(meta.messageID)
                    chatProxy.messages.push(message)
                } else if (msg.event == EventMessageTextTyping) {
                    const found = findMessage(chatProxy, meta.messageID);
                    if (!found) {
                        console.info("can't find a message to deal with, skipping... chatId,messageId: ", chatId,meta.messageID)
                        return
                    }
                    const text: SSEMsgText = data
                    onTyping(found, text.text)
                } else if (msg.event == EventMessageTextEOF) {
                    const found = findMessage(chatProxy, meta.messageID);
                    if (!found) {
                        console.info("can't find a message to deal with, skipping... chatId,messageId: ", chatId,meta.messageID)
                        return
                    }
                    const text: SSEMsgText = data
                    onEOF(found, text.text??"")
                } else if (msg.event == EventMessageAudio) {
                    const found = findMessage(chatProxy, meta.messageID);
                    if (!found) {
                        console.info("can't find a message to deal with, skipping... chatId,messageId: ", chatId,meta.messageID)
                        return
                    }
                    const audio: SSEMsgAudio = data
                    const blob = base64ToBlob(audio.audio, audioPlayerMimeType);
                    const audioId = formatNow() + "-" + randomHash16Char()
                    audioDb.setItem(audioId, blob, () => {
                        onAudio(found!, {id: audioId, durationMs: audio.durationMs})
                    })
                } else if (msg.event === EventMessageError) {
                    const found = findMessage(chatProxy, meta.messageID);
                    if (!found) {
                        console.info("can't find a message to deal with, skipping... chatId,messageId: ", chatId,meta.messageID)
                        return
                    }
                    const error = data as SSEMsgError
                    onError(found, error.errMsg)
                } else {
                    console.warn("unknown event type:", msg.event)
                }
            },
            onerror: (err) => {
                console.error("SSE error", err)
            }
        })
        return () => {
            ctrl.abort("reconnecting")
        }
    }, [networkSnp, authSnp])
    return null
}

