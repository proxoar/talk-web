import React from 'react';
import {ClientAbility} from "../../../state/data-structure/client-ability/client-ability.tsx";
import ChatGpt from "./chat-gpt.tsx";
import GoogleTTS from "./google-tts.tsx";

type Props = {
    abilityProxy: ClientAbility
}

export const AbilitySetting: React.FC<Props> = ({abilityProxy}) => {

    return (
        <>
            {abilityProxy.llm.chatGPT.available ? <ChatGpt chatGPTProxy={abilityProxy.llm.chatGPT}/> : <></>}
            {abilityProxy.tts.google.available ? <GoogleTTS googleTTSProxy={abilityProxy.tts.google}/> : <></>}
        </>
    )
}

