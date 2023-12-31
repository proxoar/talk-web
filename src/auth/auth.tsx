import {motion} from 'framer-motion'
import React, {useCallback, useEffect, useState} from 'react'
import {AxiosError, AxiosResponse} from "axios"
import {useNavigate} from "react-router-dom"
import {login} from "../api/restful/api.ts"
import {savePassAsHash, setLoggedIn} from "../state/app-state.ts"
import {cx} from "../util/util.tsx"
import {Helmet} from 'react-helmet-async'
import {GranimWallpaper} from "../wallpaper/granim-wallpaper.tsx"

const detectDelay = 1000
const fadeOutDuration = 1500

// (0,0) -> (-500,0) -> (500,0) -> ...
const shakeAnimation = {
    x: [0, -30, 30, -30, 30, 0],
    y: [0, 0, 0, 0, 0, 0],
}

export default function Auth() {
    const navigate = useNavigate()

    const [textLight, setTextLight] = useState<boolean>(false)

    const [inputValue, setInputValue] = useState('')
    const [shake, setShake] = useState(false)
    const [startFadeOut, setStartFadeOut] = useState(false)
    const [startFadeIn, setStartFadeIn] = useState(false)

    // use this function to detect where password is required by Talk server
    const handleLogin = useCallback((detect: boolean, password?: string) => {
        setShake(false)
        login(password).then((r: AxiosResponse) => {
            console.info("login is successful", r.status, r.data)
            if (password) {
                savePassAsHash(password)
            }
            setLoggedIn(true)
            setStartFadeOut(true)
            setTimeout(() => navigate("/chat"), fadeOutDuration)
        }).catch((e: AxiosError) => {
            console.info("failed to login", e)
            if (!detect) {
                setInputValue('')
                setShake(true)
            }
        })
    }, [navigate])

    // detect if login is required
    useEffect(() => {
        const t = setTimeout(() => handleLogin(true)
            , detectDelay)
        return () => clearTimeout(t)
    }, [handleLogin])

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault()
        handleLogin(false, inputValue)
    }, [handleLogin, inputValue])


    const onDark = useCallback((isDark: boolean) => {
        setTextLight(isDark)
    }, [])

    useEffect(() => {
        setStartFadeIn(true)
    }, [])

    return (
        // fadeOutDuration is shorter than duration-2000 to avoid staying in a white page
        <div className={cx("transition-opacity duration-2000", startFadeOut ? 'opacity-0' : 'opacity-100')}>
            <Helmet>
                <title>Talk - login</title>
                <meta name="description" content="You may need to login"/>
                {/* Add more meta tags as needed */}
            </Helmet>
            <div className={cx("transition-opacity duration-300", startFadeIn ? 'opacity-100' : 'opacity-0')}>
                {<GranimWallpaper onDark={onDark}/>}
                <div
                    className="flex h-screen w-screen flex-col items-center justify-center gap-14 overflow-hidden transition-colors">
                    <p className={cx("select-none font-borel text-7xl md:text-8xl lg:text-9xl tracking-widest transition duration-5000",
                        textLight ? "text-neutral-200" : "text-neutral-800"
                    )}>
                        Let&apos;s talk
                    </p>
                    <motion.form className="w-96 max-w-3/4 mb-[25vh]"
                                 onSubmit={handleSubmit}
                                 animate={shake ? shakeAnimation : {}}
                                 transition={{stiffness: 300, damping: 30}}
                    >
                        {/*<input type="text" id="username" hidden={true} autoComplete="current-password" aria-hidden="true" required={false}/>*/}
                        <motion.input
                            type="password"
                            inputMode="url"
                            id="password"
                            value={inputValue}
                            autoComplete="current-password"
                            onChange={(e) => {
                                setInputValue(e.target.value)
                                setShake(false)
                            }}
                            className={cx("appearance-none w-full h-16 rounded-lg outline-none caret-transparent",
                                "text-6xl text-center tracking-widest bg-white backdrop-blur bg-opacity-10 transition duration-5000",
                                textLight ? "text-neutral-200" : "text-neutral-800")}
                        />
                    </motion.form>
                </div>
            </div>
        </div>
    )
}
