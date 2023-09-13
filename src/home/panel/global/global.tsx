import React from 'react';
import {LLM} from "../shared/llm/llm.tsx";
import {ClientOption} from "../../../data-structure/client-option.tsx";
import {TTS} from "../shared/tts/tts.tsx";
import {useSnapshot} from "valtio/react";
import {STT} from "../shared/stt/stt.tsx";
import {OtherSetting} from "./other-setting.tsx";

type Props = {
    optionProxy: ClientOption
}

export const Global: React.FC<Props> = ({optionProxy}) => {
    useSnapshot(optionProxy)
    return (
        <>
            <div className="z-40 w-full">
                <LLM llmOptionProxy={optionProxy.llm}/>
            </div>
            <div className="z-30 w-full">
                <TTS ttsOptionProxy={optionProxy.tts}/>
            </div>
            <div className="z-20 w-full">
                <STT sttOptionProxy={optionProxy.stt}/>
            </div>
            <div className="z-10 w-full">
                <OtherSetting/>
            </div>
        </>
    )
}

