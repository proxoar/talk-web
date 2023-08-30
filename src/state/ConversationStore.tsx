import {create} from 'zustand';
import {Conversation, QueAns} from "../ds/Conversation.tsx";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {zustandStorage} from "../store/ZustandDB.tsx";
import {MyText} from "../ds/Text.tsx";
import {Audio} from "../ds/Audio.tsx";

export const useConvStore = create<Conversation>()(
    devtools(
        persist((set, get) => ({
            qaSlice: [],
            pushQueAns: (queAns: QueAns) => set((state) => ({qaSlice: [...state.qaSlice, queAns]})),
            removeQueAns: (queAns: QueAns) =>
                set((state) => ({
                    qaSlice: state.qaSlice.filter((qa) => qa.id !== queAns.id),
                })),
            updateQueAns: (queAns: QueAns) =>
                set((state) => ({
                    qaSlice: state.qaSlice.map((qa) => qa.id === queAns.id ? queAns : qa),
                })),
            updateQueText: (id: string, myText: MyText) =>
                set((state) => ({
                    qaSlice: state.qaSlice.map((qa) => qa.id === id ? {
                        ...qa, que: {
                            ...qa.que,
                            text: myText
                        }
                    } : qa),
                })),
            updateQueAudio: (id: string, audio: Audio) =>
                set((state) => ({
                    qaSlice: state.qaSlice.map((qa) => qa.id === id ? {
                        ...qa, que: {
                            ...qa.que,
                            audio: audio
                        }
                    } : qa),
                })),
            updateAnsText: (id: string, myText: MyText) =>
                set((state) => ({
                    qaSlice: state.qaSlice.map((qa) => qa.id === id ? {
                        ...qa, ans: {
                            ...qa.ans,
                            text: myText
                        }
                    } : qa),
                })),
            updateAnsAudio: (id: string, audio: Audio) =>
                set((state) => ({
                    qaSlice: state.qaSlice.map((qa) => qa.id === id ? {
                        ...qa, ans: {
                            ...qa.ans,
                            audio: audio
                        }
                    } : qa),
                })),
            getQueText: (id: string) => get().qaSlice.find(qa => qa.id === id)!.que.text,
            getQueAudio: (id: string) => get().qaSlice.find(qa => qa.id === id)!.que.audio,
            getAnsText: (id: string) => get().qaSlice.find(qa => qa.id === id)!.ans.text,
            getAnsAudio: (id: string) => get().qaSlice.find(qa => qa.id === id)!.ans.audio,

        }), {
            name: 'conversation',
            storage: createJSONStorage<string>(() => zustandStorage), // (optional) by default the 'localStorage' is used
        })
    )
);