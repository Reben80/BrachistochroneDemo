import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion'

const BrachistochroneDemo = () => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'paused'>('idle')
  const [animationSpeed, setAnimationSpeed] = useState(0.5)
  const [cycloidParameter, setCycloidParameter] = useState(0.2)
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({})
  const [rankings, setRankings] = useState<string[]>([])
  const [prevRankings, setPrevRankings] = useState<string[]>([])
  const startTimeRef = useRef<number | null>(null)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [pausedElapsedTime, setPausedElapsedTime] = useState(0)
  const lastTimestampRef = useRef<number | null>(null)

  const curves = {
    'Brachistochrone': {
      func: (t: number) => {
        const theta = t * Math.PI
        return [(theta - Math.sin(theta)) / Math.PI, (1 - Math.cos(theta)) / 2]
      },
      color: '#3b82f6',
      time: 2.0
    },
    'Straight Line': {
      func: (t: number) => [t, t],
      color: '#ef4444',
      time: 2.5
    },
    'Parabola': {
      func: (t: number) => [t, t * (2 - t)],
      color: '#8b5cf6',
      time: 2.1
    },
    'Parametric Cycloid': {
      func: (t: number) => {
        return [
          t - Math.sin(Math.PI * t) / Math.PI,
          (1 - Math.cos(Math.PI * t)) / 2 + cycloidParameter * Math.pow(Math.sin(Math.PI * t), 2)
        ]
      },
      color: '#f59e0b',
      time: 2.0 * (1 + cycloidParameter)
    }
  }

  useEffect(() => {
    const mainCanvas = mainCanvasRef.current
    if (!mainCanvas) return

    const ctx = mainCanvas.getContext('2d')
    if (!ctx) return

    const width = mainCanvas.width
    const height = mainCanvas.height
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const graphWidth = width - margin.left - margin.right
    const graphHeight = height - margin.top - margin.bottom

    let animationFrameId: number

    const drawStaticElements = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      for (let x = 0; x <= graphWidth; x += graphWidth / 10) {
        ctx.beginPath()
        ctx.moveTo(margin.left + x, margin.top)
        ctx.lineTo(margin.left + x, height - margin.bottom)
        ctx.stroke()
      }
      for (let y = 0; y <= graphHeight; y += graphHeight / 10) {
        ctx.beginPath()
        ctx.moveTo(margin.left, margin.top + y)
        ctx.lineTo(width - margin.right, margin.top + y)
        ctx.stroke()
      }

      // Draw axes
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, height - margin.bottom)
      ctx.lineTo(width - margin.right, height - margin.bottom)
      ctx.stroke()

      // Draw axis labels
      ctx.fillStyle = '#1e293b'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Time', width / 2, height - 10)
      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Height', 0, 0)
      ctx.restore()

      // Draw curves
      Object.entries(curves).forEach(([label, curve]) => {
        ctx.beginPath()
        ctx.strokeStyle = curve.color
        ctx.lineWidth = 2
        for (let t = 0; t <= 1; t += 0.01) {
          const [x, y] = curve.func(t)
          ctx.lineTo(margin.left + x * graphWidth, margin.top + y * graphHeight)
        }
        ctx.stroke()
      })

      // Draw starting balls only if animation is not running
      if (animationState !== 'running') {
        Object.entries(curves).forEach(([label, curve]) => {
          const [x, y] = curve.func(0)
          ctx.beginPath()
          ctx.arc(margin.left + x * graphWidth, margin.top + y * graphHeight, 8, 0, 2 * Math.PI)
          ctx.fillStyle = curve.color
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()
        })
      }
    }

    // Draw static elements initially
    drawStaticElements()

    const drawFrame = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        lastTimestampRef.current = timestamp;
      }

      let elapsedTime;
      if (animationState === 'running') {
        const deltaTime = timestamp - (lastTimestampRef.current || timestamp);
        elapsedTime = pausedElapsedTime + deltaTime / 1000 * animationSpeed;
        lastTimestampRef.current = timestamp;
      } else {
        elapsedTime = pausedElapsedTime;
      }

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw static elements
      drawStaticElements();

      // Draw animated balls
      Object.entries(curves).forEach(([label, curve]) => {
        const progress = Math.min(elapsedTime / curve.time, 1);
        const [x, y] = curve.func(progress);
        ctx.beginPath();
        ctx.arc(margin.left + x * graphWidth, margin.top + y * graphHeight, 8, 0, 2 * Math.PI);
        ctx.fillStyle = curve.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Calculate current position and distance to endpoint for each curve
      const progressData: [string, number, number][] = Object.entries(curves).map(([label, curve]) => {
        const progress = Math.min(elapsedTime / curve.time, 1);
        const [x, y] = curve.func(progress);
        return [label, progress, 0];
      });

      // Sort based on distance to endpoint (lower distance means closer to finishing)
      progressData.sort((a, b) => a[2] - b[2]);

      // Update rankings
      const newRankings = progressData.map(([label]) => label);
      if (JSON.stringify(newRankings) !== JSON.stringify(rankings)) {
        setPrevRankings(rankings);
        setRankings(newRankings);
      }

      // Update elapsed times and draw balls
      setElapsedTimes(prev => {
        const newTimes = { ...prev };
        progressData.forEach(([label, progress, distanceToEnd]) => {
          newTimes[label] = progress < 1 ? elapsedTime.toFixed(2) : curves[label].time.toFixed(2);
          
          // Draw ball
          const [x, y] = curves[label].func(progress);
          ctx.beginPath();
          ctx.arc(margin.left + x * graphWidth, margin.top + y * graphHeight, 8, 0, 2 * Math.PI);
          ctx.fillStyle = curves[label].color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        return newTimes;
      });

      if (elapsedTime >= Math.max(...Object.values(curves).map(c => c.time))) {
        setAnimationState('idle');
        setIsAnimationComplete(true);
      } else if (animationState === 'running') {
        setPausedElapsedTime(elapsedTime);
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    if (animationState === 'running') {
      animationFrameId = requestAnimationFrame(drawFrame);
    } else {
      drawFrame(performance.now());
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationState, curves, pausedElapsedTime, animationSpeed, cycloidParameter, rankings]);

  const handleStartAnimation = () => {
    startTimeRef.current = null;
    lastTimestampRef.current = null;
    setPausedElapsedTime(0);
    setAnimationState('running');
    setElapsedTimes({});
    setIsAnimationComplete(false);
  };

  const handlePauseAnimation = () => {
    setAnimationState('paused');
  };

  const handleResumeAnimation = () => {
    lastTimestampRef.current = null;
    setAnimationState('running');
  };

  const handleResetAnimation = () => {
    startTimeRef.current = null;
    lastTimestampRef.current = null;
    setPausedElapsedTime(0);
    setAnimationState('idle');
    setElapsedTimes({});
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold"></CardTitle>
        <CardDescription>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <canvas 
          ref={mainCanvasRef} 
          width={700} 
          height={400} 
          className="border border-gray-300 rounded-lg shadow-lg"
        />
        <div className="w-full grid grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Animation Speed</label>
            <div className="flex items-center space-x-2">
              <Slider
                min={0.1}
                max={2}
                step={0.1}
                value={[animationSpeed]}
                onValueChange={([value]) => setAnimationSpeed(value)}
                className="flex-grow"
              />
              <span className="text-sm font-medium w-12 text-right">{animationSpeed.toFixed(1)}x</span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Cycloid Parameter</label>
            <div className="flex items-center space-x-2">
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[cycloidParameter]}
                onValueChange={([value]) => setCycloidParameter(value)}
                className="flex-grow"
              />
              <span className="text-sm font-medium w-12 text-right">{cycloidParameter.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center space-x-4">
          {animationState === 'idle' && (
            <Button onClick={handleStartAnimation} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Start Animation
            </Button>
          )}
          {animationState === 'running' && (
            <Button onClick={handlePauseAnimation} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
              Pause Animation
            </Button>
          )}
          {animationState === 'paused' && (
            <Button onClick={handleResumeAnimation} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Resume Animation
            </Button>
          )}
          {animationState !== 'idle' && (
            <Button onClick={handleResetAnimation} variant="outline" className="border-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
              Reset Animation
            </Button>
          )}
        </div>

        {/* Enhanced rankings display */}
        <div className="w-full bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Live Rankings</h3>
          <AnimatePresence>
            {rankings.map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between space-x-2 p-2 rounded-md ${
                  prevRankings.indexOf(label) !== index ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold w-8">{index + 1}.</span>
                  <span 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: curves[label].color }}
                  ></span>
                  <span className="text-lg">{label}</span>
                </div>
                <AnimatePresence mode="wait">
                  {!isAnimationComplete && prevRankings.indexOf(label) !== index && (
                    <motion.span
                      key={`arrow-${label}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="text-sm font-bold"
                    >
                      {prevRankings.indexOf(label) > index ? '▲' : '▼'}
                    </motion.span>
                  )}
                  {isAnimationComplete && (
                    <motion.span
                      key={`time-${label}`}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-sm font-medium overflow-hidden whitespace-nowrap"
                    >
                      {elapsedTimes[label] || '0.00s'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

export default BrachistochroneDemo
