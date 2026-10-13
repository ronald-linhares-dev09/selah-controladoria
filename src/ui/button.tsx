import type { ReactNode } from "react";

interface ButtonProps {
    children : ReactNode
    onClick? : () => void
    disabled? : boolean
    type : 'button' | 'submit'
    ref? : string
}

export function ButtonFilter({children, onClick, disabled, type = 'button'}: ButtonProps) {
    return (
        <button
         onClick={onClick}
         disabled={disabled}
         type={type}
         
         className="font-sans text-gray-700 font-semibold text-lg px-4 py-2 transition-transform focus:border-b-2 hover:border-b-2 hover:border-b-emerald-700 focus:border-b-emerald-700">
            {children}
        </button>
    )
}

export function ButtonDark({children, onClick, disabled, type = 'button'}: ButtonProps) {
    return (
        <button
         onClick={onClick}
         disabled={disabled}
         type={type}
         className="font-sans text-white border font-semibold border-gray-900 bg-gray-900 text-[14px] px-4 py-2 cursor-pointer rounded-lg transition-transform hover:-translate-y-1">
            {children}
        </button>
    )
}

export function ButtonLight({children, onClick, disabled, type = 'button'}: ButtonProps) {
    return (
        <button
         onClick={onClick}
         disabled={disabled}
         type={type}
         className="font-sans text-gray-950 border font-semibold border-gray-400 bg-transparent text-[14px] px-4 py-2 cursor-pointer rounded-lg transition-transform hover:-translate-y-1">
            {children}
        </button>
    )
}