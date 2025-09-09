import React from 'react'

export const UICritic = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
            <h1
                className="text-8xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight mb-4 text-center"
            >
                UI Critic
            </h1>
            <p className="text-lg text-gray-500 max-w-xl text-center">
                Elevate your UI with expert feedback and beautiful design suggestions.
            </p>
        </div>
    )
}

export default UICritic
