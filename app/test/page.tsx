"use client"
import React from 'react'
import {ConfettiButton} from '@/registry/uicritic/components/confetti-button/confetti-button'
import { use } from 'framer-motion/m'

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <ConfettiButton onClick={() => console.log("Button clicked!")}>
        Celebrate
      </ConfettiButton>
    </div>
  )
}

export default page