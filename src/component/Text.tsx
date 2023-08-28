import React from 'react';
import {Spin} from "./Spin.tsx";
import {MyText} from "../ds/Text.tsx";


interface TextProps {
    text: MyText
}

export const AssistantText: React.FC<TextProps> = ({text}) => {
    switch (text.status) {
        case 'receiving':
            return <div className="w-auto px-2 py-1.5">
                <Spin/>
            </div>
        case 'typing' :
        case  'received':
            return <div
                className="rounded-lg max-w-3/4 mr-auto whitespace-pre-wrap text-neutral-900 bg-slate-200 px-2 py-0.5">
                <p>{text.text}</p>
            </div>
        case 'error':
            return <div> {text.errorMessage}</div>
        default:
            console.error('impossible text status', text.status)
            break;
    }
}

export const SelfText: React.FC<TextProps> = ({text}) => {
    switch (text.status) {
        case 'sending':
        case 'receiving':
            return <div className="self-end w-auto px-2 py-1.5">
                <Spin/>
            </div>
        case 'sent':
        case 'received':
            return <div
                className="rounded-lg self-end max-w-3/4 whitespace-pre-wrap text-violet-100 bg-blue-600 px-2 py-1.5">
                <p>{text.text}</p>
            </div>
        case 'error':
            return <div> {text.errorMessage}</div>
        default:
            console.error('impossible text status', text.status)
            break;
    }
}
