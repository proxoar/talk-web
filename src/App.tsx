import {useEffect, useRef, useState} from "react";
import Recorder from "./component/Recorder.tsx";
import {useRecorderStore} from "./state/Recording.tsx";
import {MessageList} from "./component/MessageList.tsx";
import TextArea from "./component/TextArea.tsx";
import {Workers} from "./worker/Workers.tsx";
import {SSE} from "./SSE.tsx";
import {MyRecorder} from "./util/MyRecorder.ts";
import Head from "./component/Head.tsx";
import Setting from "./component/setting/Setting.tsx";
import {useMouseStore} from "./state/Mouse.tsx";

export default function App() {
    const isRecording = useRecorderStore((state) => state.isRecording)
    const recorder = useRecorderStore<MyRecorder>((state) => state.recorder)
    const incrRecordDuration = useRecorderStore((state) => state.incrDuration)
    const setRecordDuration = useRecorderStore((state) => state.setDuration)
    const [spacePressed, setSpacePressed] = useState<boolean>(false)
    const spacePressedRef = useRef(spacePressed);
    const setMouseDown = useMouseStore(state => state.setMouseDown)
    useEffect(() => {
        if (isRecording) {
            setRecordDuration(0)
        }
        const interval = setInterval(() => {
            incrRecordDuration(50)
        }, 50);

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        };
    }, [isRecording]);

    useEffect(() => {
        spacePressedRef.current = spacePressed;
    }, [spacePressed]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            console.debug('handleKeyDown', event.code);
            if (event.code === 'Space') {
                if (event.repeat) {
                    console.debug('handleKeyDown skip repeated space');
                    return
                }
                setSpacePressed(true)
                recorder.start().catch((e) => {
                    console.error("failed to start recorder", e)
                })
            } else {
                if (spacePressedRef.current) {
                    recorder.cancel()
                }
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            console.debug('handleKeyUp', event.code);
            if (event.code == 'Space') {
                setSpacePressed(false)
                recorder.done()
            }
        };

        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousedown", () => setMouseDown(true));
        window.addEventListener("mouseup", () => setMouseDown(false));

        return () => {
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    return (
        <div className="flex items-center justify-center h-screen w-screen overflow-hidden divide-x bg-equal-800">
            <div
                className="flex flex-col items-center max-w-4xl w-full h-full rounded-l-lg justify-between gap-1 p-2 bg-white">
                <div className="flex flex-col items-center w-full mt-auto top-0 backdrop-blur bg-opacity-75">
                    <Head/>
                </div>
                <MessageList/>
                <div
                    className="flex flex-col items-center w-full mt-auto bottom-0 backdrop-blur bg-opacity-75">
                    <TextArea/>
                    <div className="flex justify-center items-center w-full mt-1">
                        <Recorder/>
                    </div>
                </div>
                <SSE/>
                <Workers/>
            </div>
            <div className="flex flex-col items-end h-full max-w-1/4 w-full rounded-r-lg bg-gray-200">
                <Setting/>
            </div>

        </div>
    )
}
