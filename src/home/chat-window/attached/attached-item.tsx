import React, {useEffect, useState} from "react"
import {LLMMessage} from "../../../shared-types.ts";
import {cx} from "../../../util/util.tsx";
import {userColor, assistantColor} from "../compnent/theme.ts";
import {LiaEllipsisHSolid} from "react-icons/lia";
import {useSnapshot} from "valtio/react";
import {layoutState} from "../../../state/layout-state.ts";

type Props = {
    message: LLMMessage
}

export const AttachedItem: React.FC<Props> = ({message}) => {

    const [fullText, setFullText] = useState(false)
    const {isPAPinning} = useSnapshot(layoutState)
    useEffect(() => {
        setFullText(false)
    }, [isPAPinning]);
    let theme
    switch (message.role) {
        case "user":
            theme = userTheme
            break;
        case "assistant":
            theme = assistantTheme
            break;
        case "system":
            theme = systemTheme
            break;
    }

    return (
        <div className="flex flex-col">
            <div
                className={cx("flex rounded-xl whitespace-pre-wrap px-3 pt-0.5 pb-0.5",
                    theme.bg, theme.text, theme.other
                )}>

                {fullText &&
                    <div className="leading-snug">{message.content}</div>
                }
                {!fullText &&
                    <div className="leading-snug">
                        {message.content.slice(0, 100)}
                        {message.content.length > 100 &&
                            <LiaEllipsisHSolid className="w-5 h-5 cursor-pointer stroke-2 text-neutral-600"
                                               onClick={
                                                   () => setFullText(true)
                                               }/>}
                    </div>}
            </div>
        </div>

    )
}

const userTheme = {
    bg: userColor.bg,
    text: userColor.text,
    other: "max-w-[85%] self-end",
}

const assistantTheme = {
    bg: assistantColor.bg,
    text: assistantColor.text,
    other: "max-w-[85%] self-start",
}

const systemTheme = {
    bg: "bg-fuchsia-600 bg-opacity-80 backdrop-blur",
    text: "text-violet-100",
    other: "max-w-[80%] self-center",
}
