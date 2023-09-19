// do not change these types by modifying fields, using the defined functions instead

import {randomHash16Char} from "../util/util.tsx";
import {Role} from "../shared-types.ts";
import {messageTimeoutSeconds} from "../config.ts";

export type MessageStatus =
    'sending'
    | 'sent'
    | 'thinking'
    | 'typing'
    | 'received'
    | 'error'
    | 'deleted'

export type MessageAudio = {
    id: string
    durationMs?: number
}

export type Message = {
    id: string
    ticketId: string
    role: Role
    status: MessageStatus
    audio?: MessageAudio
    text: string
    errorMessage?: string
    createdAt: number
    lastUpdatedAt: number
}

export const newThinking = (id: string, ticketId: string, role: Role): Message => ({
    id: id,
    ticketId: ticketId,
    role: role,
    status: "thinking",
    text: "",
    createdAt: Date.now(),
    lastUpdatedAt: Date.now()
})

export const newError = (id: string, ticketId: string,role: Role, errorMessage:string): Message => ({
    id: id,
    ticketId: ticketId,
    role: role,
    status: "error",
    text: "",
    errorMessage:errorMessage,
    createdAt: Date.now(),
    lastUpdatedAt: Date.now()
})

export const newSending = (): Message => ({
    id: randomHash16Char(),
    ticketId: randomHash16Char(),
    role: 'user',
    status: "sending",
    text: "",
    createdAt: Date.now(),
    lastUpdatedAt: Date.now()
})

export const onSent = (message: Message): void => {
    switch (message.status) {
        case "sending":
            message.status = 'sent'
            message.lastUpdatedAt = Date.now()
            break
        case "sent":
        case "thinking":
        case "typing":
        case "received":
        case "error":
            console.error("onSent is invalid, prev status:", message.status);
            break
        case "deleted":
            break
    }
}

export const onTyping = (message: Message, text: string): void => {
    switch (message.status) {
        case "thinking":
        case "typing":
            message.status = 'typing'
            message.text = message.text + text
            message.lastUpdatedAt = Date.now()
            break
        case "sending":
        case "sent":
        case "received":
        case "error":
            console.error("onTyping is invalid, prev status:", message.status, text);
            break
        case "deleted":
            break
    }
}

export const onEOF = (message: Message, text: string): void => {
    switch (message.status) {
        case "thinking":
        case "typing":
            message.status = "received"
            message.text = message.text + text
            message.lastUpdatedAt = Date.now()
            break
        case "sending":
        case "sent":
        case "received":
        case "error":
            console.error("onEOF is invalid, prev status:", message.status);
            break
        case "deleted":
            break
    }
}

export const onAudio = (message: Message, audio: MessageAudio): void => {
    switch (message.status) {
        case "sending":
        case "sent":
            message.audio = audio
            message.lastUpdatedAt = Date.now()
            break
        case "thinking":
            message.status = "received"
            message.audio = audio
            message.lastUpdatedAt = Date.now()
            break
        case "received":
        case "typing":
        case "error":
            console.error("onAudio is invalid, prev status:", message.status);
            break
        case "deleted":
            break
    }
}

export const onError = (message: Message, errorMessage: string): void => {
    switch (message.status) {
        case "sending":
        case "sent":
        case "thinking":
        case "typing":
            message.status = 'error'
            message.errorMessage = errorMessage
            message.lastUpdatedAt = Date.now()
            break
        case "error":
        case "received":
            console.error("onError is invalid, prev status:" + message.status)
            break
        case "deleted":
            break
    }
}

export const onMarkDeleted = (message: Message): void => {
    switch (message.status) {
        case "sending":
        case "sent":
        case "thinking":
        case "typing":
        case "received":
        case "error":
            message.status = "deleted"
            message.audio = undefined
            message.text = ""
            message.errorMessage = ""
            break
        case "deleted":
            console.error("onDelete is invalid, prev status:", message.status)
            break
    }
}

const pending: MessageStatus[] = ["sending", "thinking", "typing"]

export const setErrorIfTimeout = (prev: Message): boolean => {
    if (pending.includes(prev.status) && Date.now() - prev.lastUpdatedAt > messageTimeoutSeconds * 1000) {
        onError(prev, "Time out")
        return true
    }
    return false
}

const inHistory: MessageStatus[] = ["received", "sent"]
export const isInHistory = (m: Message): boolean => {
    return m.text !== "" && inHistory.includes(m.status)
}