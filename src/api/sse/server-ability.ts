// ServerAbility guide clients in adjusting all parameters.
export type ServerAbility = {
    demo: boolean
    llm: ServerLLM
    tts: ServerTTS
    stt: ServerSTT
}

// TTS
export type ServerTTS = {
    available: boolean
    google: ServerGoogleTTS
    elevenlabs: ServerElevenlabs
}

export type ServerGoogleTTS = {
    available: boolean
    voices?: TaggedItem[]
}

export type ServerElevenlabs = {
    available: boolean
    voices?: TaggedItem[]
}

// STT
export type ServerSTT = {
    available: boolean
    whisper: ServerWhisper
    google: ServerGoogleSTT
}

export type ServerWhisper = {
    available: boolean
    models?: string[]
}

export type ServerGoogleSTT = {
    available: boolean
    recognizers?: TaggedItem[]
}

// LLM
export type ServerLLM = {
    available: boolean
    chatGPT: ServerChatGPT
    gemini: ServerGemini
}

export type ServerChatGPT = {
    available: boolean
    models?: Model[]
}

export type ServerGemini = {
    available: boolean
    models?: Model[]
}

export type Model = {
    name: string
    displayName: string
}

// other
export type TaggedItem = {
    id: string
    name: string
    tags?: string [] // gender, accent, age, etc
}

export const defaultServerAbility = (): ServerAbility => {
    return {
        demo: false,
        llm: {
            available: false,
            chatGPT: {
                available: false,
            },
            gemini: {
                available: false,
            }
        },
        tts: {
            available: false,
            google: {
                available: false
            },
            elevenlabs: {
                available: false
            }
        },
        stt: {
            available: false,
            whisper: {
                available: false
            },
            google: {
                available: false
            }
        },
    }
}
