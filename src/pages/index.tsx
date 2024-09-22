import React, { useState } from 'react'
import BrachistochroneDemo from '@/components/BrachistochroneDemo'
import InstructionsPage from '@/components/InstructionsPage'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Brachistochrone Demonstration</h1>
          <p className="text-xl text-gray-600">Compare the travel times of different paths between two points under gravity</p>
        </header>

        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            {showInstructions ? "Show Demo" : "Show Instructions"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showInstructions ? 'instructions' : 'demo'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {showInstructions ? <InstructionsPage /> : <BrachistochroneDemo />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
