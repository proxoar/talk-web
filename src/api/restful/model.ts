import {LLMMessage} from "../../shared-types.ts"

export type ChatReq = {
    chatId: string // unique ID for every chat
    ticketId: string // A distinctive ID for each request, utilised by the client to associate messages.
    ms: LLMMessage[]
    talkOption: TalkOption
}

/**
 * When make a request to the Talk server, append a TalkOption to the request.
 * Each LLMOption, TTSOption, and SSTOption can only engage one provider at a time.
 * For instance, either `talkOption.llm.chatGPT` or `talkOption.llm.claude` should be set to `undefined`.
 */
export type TalkOption = {
    toText: boolean, // transcribe user's speech to text, requires STTOption option
    toSpeech: boolean, // synthesize user's text to speech, requires TTSOption
    completion: boolean, // completion, requires messages or result of transcription, require LLMOption
    completionToSpeech: boolean, // synthesize result of completion to speech, requires TTSOption
    sttOption?: STTOption,
    ttsOption?: TTSOption,
    llmOption?: LLMOption
}

export type LLMOption = {
    chatGPT?: ChatGPTOption
    gemini?: GeminiOption
}

export type ChatGPTOption = {
    model: string
    maxTokens: number
    temperature: number
    topP: number
    presencePenalty: number
    frequencyPenalty: number
}

export type GeminiOption = {
    model: string
    // stopSequences: string[]
    maxOutputTokens: number
    temperature: number
    topP: number
    topK: number
}

export type STTOption = {
    whisper?: WhisperOption
    google?: GoogleSTTOption
}

export type WhisperOption = {
    model: string
}

export type GoogleSTTOption = {
    recognizer: string
    model?: string
    language?: string
}

export type TTSOption = {
    google?: GoogleTTSOption
    elevenlabs?: ElevenlabsTTSOption
}

export type GoogleTTSOption = {
    // if VoiceId is provided, LanguageCode and Gender will not be used
    voiceId?: string
    // if languageCode is undefined, server should return an error, it's users' responsibility to choose a language
    languageCode?: string
    /**
     * An unspecified gender.
     * In VoiceSelectionParams, this means that the client doesn't care which
     * gender the selected voice will have. In the Voice field of
     * ListVoicesResponse, this may mean that the voice doesn't fit any of the
     * other categories in this enum, or that the gender of the voice isn't known.
     * SsmlVoiceGender_SSML_VOICE_GENDER_UNSPECIFIED SsmlVoiceGender = 0
     * A male voice.
     * SsmlVoiceGender_MALE SsmlVoiceGender = 1
     * A female voice.
     * SsmlVoiceGender_FEMALE SsmlVoiceGender = 2
     * A gender-neutral voice. This voice is not yet supported.
     * SsmlVoiceGender_NEUTRAL SsmlVoiceGender = 3
     */
    gender?: GoogleTTSGender
    speakingRate: number
    pitch: number
    volumeGainDb: number
}

export type ElevenlabsTTSOption = {
    voiceId: string
    stability: number
    clarity: number
}

export enum GoogleTTSGender {
    unspecified = 0,
    male = 1,
    female = 2,
    neutral = 3
}
