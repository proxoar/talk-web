import {ServerLLM} from "../../api/sse/server-ability.ts";
import {ClientChatGPT, defaultClientChatGPT, mergeChatGPT, toChatGPTOption} from "./chat-gpt.ts";
import {LLMOption} from "../../api/option.ts";

export type ClientLLM = {
    available: boolean
    chatGPT: ClientChatGPT
}

export const maxHistory = (llm: ClientLLM): number => {
    if (!llm.available) {
        return 0;
    }
    const gpt = llm.chatGPT;
    if (gpt.available && gpt.enabled) {
        return gpt.maxHistory.chosen ?? gpt.maxHistory.default;
    }
    return 0;
}

export const mergeLLM = (c: ClientLLM, s: ServerLLM): ClientLLM => {
    return {
        ...c,
        available: s.available,
        chatGPT: mergeChatGPT(c.chatGPT, s.chatGPT)
    }
}

export const toLLMOption = (llm: ClientLLM): LLMOption | undefined => {
    return llm.available ? {
        chatGPT: toChatGPTOption(llm.chatGPT)
    } : undefined
}

export const defaultClientLLM = (): ClientLLM => ({
    available: false,
    chatGPT: defaultClientChatGPT(),
})
