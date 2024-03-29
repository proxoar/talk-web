import {Panel} from "./panel/panel.tsx"
import {SSE} from "../api/sse/sse.tsx"
import {Workers} from "../worker/workers.tsx"
import {WindowListeners} from "../window-listeners.tsx"
import {ChatWindow} from "./chat-window/chat-window.tsx"
import {useEffect} from "react"
import {useSnapshot} from "valtio/react"
import {appState, hydrationState} from "../state/app-state.ts"
import {useNavigate} from "react-router-dom"
import {Helmet} from 'react-helmet-async'
import {TheWallpaper} from "../wallpaper/wallpaper.tsx"
import {cx} from "../util/util.tsx";


export default function Home() {
    const {hydrated} = useSnapshot(hydrationState)
    const {auth} = useSnapshot(appState)
    const {showSidebar} = useSnapshot(appState.pref)
    const navigate = useNavigate()

    useEffect(() => {
        if (hydrationState.hydrated && !appState.auth.loggedIn) {
            navigate("/auth")
        }
    }, [hydrated, auth, navigate])
    // console.info("Home rendered", new Date().toLocaleString())

    return (
        <div>
            <Helmet>
                <title>Let's Talk</title>
            </Helmet>
            <TheWallpaper/>
            {hydrated &&
                <>
                    <div
                        className="flex h-screen w-screen items-center justify-center gap-2 overflow-hidden p-3 lg:gap-5">
                        <div className={cx("h-full min-w-60 max-w-80 w-[35%]",
                            showSidebar ? "hidden sm:block" : "hidden"
                        )}>
                            <Panel/>
                        </div>
                        <ChatWindow/>
                    </div>
                    <SSE/>
                    <Workers/>
                    <WindowListeners/>
                </>
            }
        </div>
    )
}
