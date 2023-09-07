import React, {KeyboardEventHandler, useEffect, useRef, useState} from "react";
import {useMouseStore} from "../../../state/mouse.tsx";
import {Choice} from "../../../data-structure/ability/types.ts";

type Props<T extends number | string> = {
    title: string
    choices: Choice<T>[]
    value: T
    setValue: (value: T) => void
    fallbackValue: T,
    showRange: boolean, // show range or single point
    range?: { rangeStart: T, rangeEnd: T }
    outOfLeftBoundary?: T // whether set value to this as mouse moves out of left-most element, usually as zero
}

type ChoiceColor<T extends number | string> = {
    index: number
    choice: Choice<T>
    inRange: boolean
}

export function DiscreteRange<T extends string | number>({
                                                             title,
                                                             choices,
                                                             value,
                                                             setValue,
                                                             fallbackValue,
                                                             showRange,
                                                             outOfLeftBoundary,
                                                             range
                                                         }: Props<T>) {

    const [choiceColor, setChoiceColors] = useState<ChoiceColor<T>[]>([])
    const [containsValue, setChoiceContainsValue] = useState<boolean>(false)
    const inputBoxRef = useRef<HTMLInputElement>(null);
    const [valueUpdated, setValueUpdated] = useState(0)

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const target = e.target.value
        const found = choices.find((c) => c.name === target)?.value
        let res: T
        if (found !== undefined) {
            res = found
        } else if (typeof value === 'string' && range && range.rangeStart <= target && target <= range.rangeEnd) {
            res = target as T
        } else if (typeof value === 'number') {
            if (range && range.rangeStart <= target && target <= range.rangeEnd) {
                if (!target.match(/^-?\d+(\.\d+)?$/)) {
                    res = fallbackValue
                } else if (target.includes(".")) {
                    res = Number.parseFloat(target) as T
                } else {
                    res = Number.parseInt(target) as T
                }
            } else {
                res = fallbackValue
            }
        } else {
            res = fallbackValue
        }
        setValue(res)
        setValueUpdated(valueUpdated + 1)
    }

    useEffect(() => {
        if (!inputBoxRef.current) {
            return
        }
        const found = choices.find((c) => c.value === value)?.name
        if (found !== undefined) {
            inputBoxRef.current.value = found
            inputBoxRef.current.size = found.length + 1
        } else {
            inputBoxRef.current.value = value.toString()
            inputBoxRef.current.size = value.toString().length + 1
        }
    }, [value, choices, valueUpdated]);

    useEffect(() => {
        const res: ChoiceColor<T>[] = []
        const contain = choices.find(it => it.value == value) !== undefined
        for (let i = 0; i < choices.length; i++) {
            res.push({
                index: i,
                choice: choices[i],
                // only render color when div is in selected range
                inRange: showRange ? contain && value !== undefined && choices[i].value <= value : choices[i].value === value
            })
        }
        setChoiceContainsValue(contain)
        setChoiceColors(res)
    }, [choices, value])

    const handleMouseLeaveFirstElement = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (outOfLeftBoundary === undefined) {
            return
        }
        if (useMouseStore.getState().isMouseDown) {
            const {clientY} = event;
            const {right} = event.currentTarget.getBoundingClientRect();
            // if mouse doesn't leave from right side
            if (clientY < right) {
                setValue(outOfLeftBoundary)
            }
        }
    }

    const handleMouseEnterChild = (oc: ChoiceColor<T>) => {
        if (useMouseStore.getState().isMouseDown) {
            setValue(oc.choice.value)
        }
    }

    const handleMouseDownChild = (oc: ChoiceColor<T>) => {
        setValue(oc.choice.value)
    }

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
        if (event.code == 'Escape') {
            inputBoxRef.current?.blur()
        }
    }

    return (
        <div className="flex flex-col gap-y-0.5">
            <div className="flex justify-between items-center max-h-10">
                <p className="text-neutral-600">{title}</p>
                <input
                    ref={inputBoxRef}
                    className={"min-w-11 max-h-6 text-center px-1 align-middle outline-0 overflow-hidden border border-neutral-500 rounded-xl resize-none "
                        + (containsValue ? "bg-transparent" : "bg-blue-600 text-neutral-100")}
                    onBlur={onBlur}
                    onInput={(e) => e.currentTarget.size = e.currentTarget.value.length + 1}
                    onFocus={(e) => {
                        e.target.select()
                    }}
                    onKeyDown={handleKeyDown}
                >
                </input>
            </div>

            <div
                className="flex justify-center items-center w-full border border-neutral-500 rounded-xl overflow-hidden">
                <div
                    className={"flex  justify-start items-center  w-full overflow-auto "}>
                    {choiceColor.map((oc: ChoiceColor<T>) =>
                        <div
                            className={"flex justify-center items-center flex-grow " + (oc.inRange ? "bg-blue-600" : "")
                                + (showRange ? '' : ' rounded-full')}
                            key={oc.index}
                            onMouseLeave={oc.index == 0 ? handleMouseLeaveFirstElement : () => {
                            }}
                            onMouseDown={() => handleMouseDownChild(oc)}
                            onMouseEnter={() => handleMouseEnterChild(oc)}
                        >
                            <p className={"prose text-center px-0.5 " + (oc.inRange ? "text-neutral-100 " : "text-neutral-800 ")}>
                                {oc.choice.name}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}