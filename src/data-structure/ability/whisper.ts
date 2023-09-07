import {ServerWhisper} from "../../api/sse/server-ability.ts";
import {ChooseOne, getOrDefault, mergeChoice} from "./types.ts";
import {WhisperOption} from "../../api/option.ts";
import {produce} from "immer";

export type ClientWhisper = {
    enabled: boolean // represents user's choice to disable ChatGPT, irrespective of its availability - preventing use of TTS.
    available: boolean // indicates if server provides support for ChatGPT
    models: ChooseOne<string>
}

export const mergeWhisper = (c: ClientWhisper, s: ServerWhisper): ClientWhisper =>
    produce(c, draft => {
            draft.available = s.available
            if (s.available) {
                draft.models.choices = s.models?.map((m) => ({name: m, value: m, tags: []})) ?? []
                draft.models.chosen = mergeChoice(c.models, s.models ?? [])
            }
        }
    )

export const toWhisperOption = (whisper: ClientWhisper): WhisperOption | undefined => {
    if (!whisper.enabled || !whisper.available) {
        return undefined
    }
    return {
        model: getOrDefault(whisper.models, "")
    }
}

// see https://platform.openai.com/docs/api-reference/audio/createTranscription
export const defaultClientWhisper = (): ClientWhisper => {
    return {
        enabled: true,
        available: false,
        models: {
            choices: [{name: "whisper-1", value: "whisper-1", tags: []}]
        }
    }
}