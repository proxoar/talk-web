import React, {useEffect, useState} from "react";
import {useMouseStore} from "../../../state/mouse.tsx";
import {Choice, NumStr} from "../../../ds/ability/client-ability.tsx";

type Props = {
    title: string
    choices: Choice[]
    value: NumStr
    setValue: (value: NumStr) => void
    outOfLeftBoundary?: NumStr // whether set value to this as mouse moves out of left-most element, usually as zero
}

type ChoiceColor = {
    index: number
    choice: Choice
    inRange: boolean
}

export const DiscreteRange: React.FC<Props> = ({title, choices, value, setValue, outOfLeftBoundary}) => {

    const [choicesContainsValue, setChoicesContainsValue] = useState<ChoiceColor[]>([])
    const [containsValue, setContainsValue] = useState<boolean>(false)

    useEffect(() => {

        const res: ChoiceColor[] = []
        const contain = choices.find(it => it.value == value) !== undefined
        for (let i = 0; i < choices.length; i++) {
            res.push({
                index: i,
                choice: choices[i],
                // only render color when div is in selected range
                inRange: contain && value !== undefined && choices[i].value <= value
            })
        }
        setContainsValue(contain)
        setChoicesContainsValue(res)
    }, [choices, value, setValue])

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

    const handleMouseEnterChild = (oc: ChoiceColor) => {
        if (useMouseStore.getState().isMouseDown) {
            setValue(oc.choice.value)
        }
    }

    const handleMouseDownChild = (oc: ChoiceColor) => {
        setValue(oc.choice.value)
    }

    // const c = <div className="grid grid-flow-row-dense grid-cols-3 gap-4 grow overflow-scroll"/>

    return (
        <div className="flex flex-col gap-y-0.5">
            <div className="flex justify-between items-center max-h-10 ring-transparent ">
                <p className="text-neutral-600">{title}</p>
                <textarea
                    className={"w-11 max-h-6 outline-0 overflow-hidden text-center align-middle border border-neutral-500 rounded-xl resize-none "
                        + (containsValue ? "bg-transparent" : "bg-blue-600 text-neutral-100")}
                    rows={1}
                    onChange={e => setValue(e.target.value)}
                    onFocus={(e)=>{e.target.select()}}
                    value={value}
                >
            </textarea>
            </div>

            <div
                className="flex justify-center items-center w-full border border-neutral-500 rounded-xl overflow-hidden">
                <div
                    className={"flex  justify-start items-center  w-full overflow-auto "}>
                    {choicesContainsValue.map((oc: ChoiceColor) =>
                        <div
                            className={"flex justify-center items-center flex-grow " + (oc.inRange ? "bg-blue-600" : "")}
                            key={oc.index}
                            onMouseLeave={oc.index == 0 ? handleMouseLeaveFirstElement : () => {
                            }}
                            onMouseDown={() => handleMouseDownChild(oc)}
                            onMouseEnter={() => handleMouseEnterChild(oc)}
                        >
                            <p className={"prose text-center px-0.5 " + (oc.inRange ? "text-neutral-100" : "text-neutral-800")}>
                                {oc.choice.name}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}