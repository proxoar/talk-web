import React, {useCallback} from 'react';
import {useSnapshot} from "valtio/react";
import {appState, Chat, PanelSelection} from "../../../state/app-state.ts";
import {controlState} from "../../../state/control-state.ts";
import {ChatList} from "./chat/chat-list.tsx";
import {AbilitySetting} from "./setting/ability/ability-setting.tsx";
import {GlobalOtherSetting} from "./setting/global-other-setting.tsx";
import {CurrentOtherSetting} from "./setting/current-other-setting.tsx";
import {escapeSpaceKey, joinClasses} from "../../../util/util.tsx";

type Props = {
    chatProxy?: Chat
}

export const Panel: React.FC<Props> = ({chatProxy}) => {

    const controlSnp = useSnapshot(controlState)
    const appSnp = useSnapshot(appState)

    const onMouseUp = useCallback((p: PanelSelection) => {
        appState.panelSelection = p
    }, [])

    const onMouseDown = useCallback((p: PanelSelection) => {
        appState.panelSelection = p
    }, [])

    const onMouseEnter = useCallback((p: PanelSelection) => {
        if (controlSnp.isMouseDown) {
            appState.panelSelection = p
        }
    }, [controlSnp])

    let panelContent = <div/>
    switch (appSnp.panelSelection) {
        case "chats":
            panelContent = <ChatList/>
            break;
        case "global":
            panelContent = (<>
                <AbilitySetting abilityProxy={appState.ability}/>
                <GlobalOtherSetting/>
            </>)
            break;
        case "current":
            if (chatProxy) {
                panelContent = (
                    <>
                        <AbilitySetting abilityProxy={chatProxy.ability}/>
                        <CurrentOtherSetting chatProxy={chatProxy}/>
                    </>
                )
            } else {
                console.error("can't display setting panel for current chat, " +
                    "because there is not chat opened at this moment." +
                    "falling back to chats panel")
                appState.panelSelection = "chats"
            }
            break;
    }

    return (
        <div className="flex flex-col gap-3 w-full h-full overflow-y-hidden select-none">
            <div className="flex items-center rounded-xl font-medium min-h-12
            p-1 gap-1 bg-white bg-opacity-40">
                <div
                    className={joinClasses("flex w-1/3 justify-center items-center h-full rounded-lg transition-all duration-150",
                        appSnp.panelSelection === "chats" ? "bg-white/[0.8]" : "hover:bg-white/[0.4]")}
                    onMouseUp={() => onMouseUp("chats")}
                    onMouseDown={() => onMouseDown("chats")}
                    onMouseEnter={() => onMouseEnter("chats")}
                >
                    <p className="text-center">Chats</p>
                </div>
                <div
                    className={joinClasses("flex w-1/3 justify-center items-center h-full rounded-lg transition-all duration-150",
                        appSnp.panelSelection === "global" ? "bg-white/[0.8]" : "hover:bg-white/[0.4]")}
                    onMouseUp={() => onMouseUp("global")}
                    onMouseDown={() => onMouseDown("global")}
                    onMouseEnter={() => onMouseEnter("global")}
                >
                    <p className="text-center">Setting</p>
                </div>
                <div className={
                    joinClasses(
                        "flex w-1/3 justify-center items-center h-full rounded-lg transition-all duration-150",
                        chatProxy === undefined ? "hidden" : "",
                        appSnp.panelSelection === "current" ? "bg-white bg-opacity-80" : "hover:bg-white/[0.4]"
                    )}
                     onMouseUp={() => onMouseUp("current")}
                     onMouseDown={() => onMouseDown("current")}
                     onMouseEnter={() => onMouseEnter("current")}
                >
                    <p className="text-center">Current</p>
                </div>
            </div>
            <div className="flex flex-col w-full h-full items-center gap-2"
                 onKeyDown={escapeSpaceKey}
            >
                {panelContent}
            </div>
        </div>
    )
}