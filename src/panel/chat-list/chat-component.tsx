import React, {useCallback, useEffect, useState} from "react";
import {useSnapshot} from "valtio/react";
import {appState, Chat, deleteChat} from "../../state/app-state.ts";
import {controlState} from "../../state/control-state.ts";
import {Preview} from "./preview.tsx";

type Props = {
    chatSnp: Chat
}

export const ChatComponent: React.FC<Props> = ({chatSnp}) => {
    const appSnp = useSnapshot(appState)
    const controlSnp = useSnapshot(controlState)
    const [selected, setSelected] = useState(false)
    const [over, setMouseOver] = useState(false)

    const onContainerMouseDownOrUp = useCallback(() => {
        appState.currentChatId = chatSnp.id
    }, [chatSnp.id])

    const onMouseEnter = useCallback(() => {
        if (controlSnp.isMouseDown) {
            appState.currentChatId = chatSnp.id
        }
    }, [chatSnp.id, controlSnp.isMouseDown])

    const removeChat = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        deleteChat(chatSnp.id)
    }, [chatSnp.id])

    const onDeleteButtonMouseDownOrUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
    }, [])

    useEffect(() => {
        setSelected(appSnp.currentChatId === chatSnp.id)
    }, [appSnp, chatSnp]);


    return (
        <div
            className="relative flex gap-1 justify-between items-center"
            onMouseOver={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseDown={onContainerMouseDownOrUp}
            onMouseUp={onContainerMouseDownOrUp}
            onMouseEnter={onMouseEnter}
        >
            <div
                className={`w-full pl-3 pr-10 py-1 gap-y-0.5 flex-col h-14 font-medium text-neutral-800 rounded-lg 
                 transition-all duration-100 ${selected ? " bg-white bg-opacity-90" : "bg-white bg-opacity-40 " +
                    "hover:bg-neutral-100 hover:bg-opacity-70 "}`}
            >
                <div className="">
                    <p className="w-auto break-keep">{chatSnp.name}</p>
                </div>
                <div className="">
                    <div className="w-auto text-sm text-neutral-600">
                        <Preview chatSnp={chatSnp}/>
                    </div>
                </div>
            </div>
            {over && <div
                className="absolute right-2 text-neutral-500 rounded-lg p-0.5 hover:text-neutral-100 hover:bg-neutral-500/[0.4]"
                onMouseDown={onDeleteButtonMouseDownOrUp}
                onMouseUp={onDeleteButtonMouseDownOrUp}
                onClick={removeChat}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                     stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </div>}

        </div>
    )
}
