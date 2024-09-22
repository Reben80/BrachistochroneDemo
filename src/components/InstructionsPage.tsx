import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";

const InstructionsPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [cycloidParameter, setCycloidParameter] = useState(0.5);

  const generateBrachistochronePath = () => {
    const points = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (Math.PI * i) / steps;
      const x = ((t - Math.sin(t)) / Math.PI) * 300;
      const y = ((1 - Math.cos(t)) / 2) * 300;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const generateParametricCycloidPath = (E: number) => {
    const points = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (t - Math.sin(Math.PI * t) / Math.PI) * 300;
      const y = (-(1 - Math.cos(Math.PI * t)) / 2 + E * Math.pow(Math.sin(Math.PI * t), 2)) * -300;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const curves = [
    {
      name: 'Brachistochrone',
      description: 'The curve of fastest descent under gravity.',
      details: 'Discovered by Johann Bernoulli in 1696, the Brachistochrone curve represents the path that a particle will take under the influence of gravity to travel between two points in the least amount of time. Interestingly, this curve is a segment of a cycloid.',
      equations: [
        '(x(t), y(t)) = ((t-sin(t))/π, -(1-cos(t))/2)',
        'Where 0 ≤ t ≤ π'
      ],
      color: '#3b82f6',
      svg: (
        <svg viewBox="0 0 300 300" className="w-full h-auto">
          <polyline
            points={generateBrachistochronePath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
          />
        </svg>
      )
    },
    {
      name: 'Straight Line',
      description: 'The shortest path between two points.',
      details: 'While the straight line is the shortest distance between two points, it is not the fastest path when considering the effects of gravity. This curve serves as a baseline for comparison in our demonstration.',
      equations: [
        'y = x',
        'Or in parametric form:',
        'x(t) = t',
        'y(t) = t',
        'Where 0 ≤ t ≤ 1'
      ],
      color: '#ef4444',
      svg: (
        <svg viewBox="0 0 300 300" className="w-full h-auto">
          <line x1="0" y1="0" x2="300" y2="300" stroke="#ef4444" strokeWidth="3" />
        </svg>
      )
    },
    {
      name: 'Parabola',
      description: 'A quadratic curve between the start and end points.',
      details: "The parabola represents a compromise between the straight line and the Brachistochrone. It provides a curved path that allows for some acceleration due to gravity, but it's not optimized for the fastest descent.",
      equations: [
        'y = -x(2 - x)',
        'Or in parametric form:',
        'x(t) = t',
        'y(t) = -t(2 - t)',
        'Where 0 ≤ t ≤ 1'
      ],
      color: '#8b5cf6',
      svg: (
        <svg viewBox="0 0 300 300" className="w-full h-auto">
          <path d="M0,0 Q 150,300 300,300" fill="none" stroke="#8b5cf6" strokeWidth="3" />
        </svg>
      )
    },
    {
      name: 'Parametric Cycloid',
      description: 'A modified cycloid curve with an adjustable parameter.',
      details: "This curve is a variation of the cycloid, which is closely related to the Brachistochrone. By adjusting the parameter E, you can see how small changes in the curve's shape affect the descent time. When E is 0, this curve is very similar to the Brachistochrone.",
      equations: [
        '(x(t), y(t)) = (t - sin(πt)/π, -(1-cos(πt))/2 + E*sin²(πt))',
        'Where E is the adjustable parameter (0 ≤ E ≤ 1) and 0 ≤ t ≤ 1'
      ],
      color: '#f59e0b',
      svg: (E: number) => (
        <svg viewBox="0 0 300 300" className="w-full h-auto">
          <polyline
            points={generateParametricCycloidPath(E)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
          />
        </svg>
      )
    }
  ];

  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Instructions and Curve Explanations</CardTitle>
        <CardDescription>
          Learn about the different curves used in the Brachistochrone demonstration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          This demonstration compares the descent times of different curves between two points under the influence of gravity. Click on each curve name to learn more about its properties and equations.
        </p>
        {curves.map((curve) => (
          <div key={curve.name} className="mb-4">
            <Button
              onClick={() => toggleSection(curve.name)}
              variant="outline"
              className="w-full justify-between"
            >
              <span style={{color: curve.color}}>{curve.name}</span>
              <span>{openSection === curve.name ? '▼' : '▶'}</span>
            </Button>
            {openSection === curve.name && (
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 pr-4">
                    <p className="font-semibold">{curve.description}</p>
                    <p className="mt-2">{curve.details}</p>
                    <div className="mt-2">
                      <p className="font-semibold">Equations:</p>
                      {curve.equations.map((eq, index) => (
                        <pre key={index} className="bg-white p-1 mt-1 rounded">{eq}</pre>
                      ))}
                    </div>
                    {curve.name === 'Parametric Cycloid' && (
                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium">
                          Adjust E parameter: {cycloidParameter.toFixed(2)}
                        </label>
                        <Slider
                          min={0}
                          max={1}
                          step={0.01}
                          value={[cycloidParameter]}
                          onValueChange={([value]) => setCycloidParameter(value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/2 mt-4 md:mt-0">
                    <div className="border border-gray-300 rounded-md p-2 bg-white">
                      {curve.name === 'Parametric Cycloid'
                        ? curve.svg(cycloidParameter)
                        : curve.svg}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InstructionsPage;