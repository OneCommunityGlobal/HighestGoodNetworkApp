"use client"

import { useState, useEffect } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

// Mock data for projects and materials
const mockProjects = [
  { id: 1, name: "Office Building" },
  { id: 2, name: "Residential Complex" },
  { id: 3, name: "Shopping Mall" },
  { id: 4, name: "Highway Bridge" },
]

const materialTypes = [
  { id: 1, name: "All Materials" },
  { id: 2, name: "Wood" },
  { id: 3, name: "Concrete" },
  { id: 4, name: "Steel" },
]

// Mock data for material usage
const mockMaterialData = {
  1: {
    // Office Building
    all: {
      available: 50,
      used: 30,
      wasted: 20,
      lastWeekUsed: 25,
    },
    wood: {
      available: 20,
      used: 15,
      wasted: 5,
      lastWeekUsed: 12,
    },
    concrete: {
      available: 15,
      used: 10,
      wasted: 5,
      lastWeekUsed: 8,
    },
    steel: {
      available: 15,
      used: 5,
      wasted: 10,
      lastWeekUsed: 5,
    },
  },
  2: {
    // Residential Complex
    all: {
      available: 60,
      used: 40,
      wasted: 10,
      lastWeekUsed: 30,
    },
    wood: {
      available: 25,
      used: 20,
      wasted: 5,
      lastWeekUsed: 15,
    },
    concrete: {
      available: 20,
      used: 15,
      wasted: 2,
      lastWeekUsed: 10,
    },
    steel: {
      available: 15,
      used: 5,
      wasted: 3,
      lastWeekUsed: 5,
    },
  },
  3: {
    // Shopping Mall
    all: {
      available: 70,
      used: 45,
      wasted: 15,
      lastWeekUsed: 35,
    },
    wood: {
      available: 15,
      used: 10,
      wasted: 5,
      lastWeekUsed: 8,
    },
    concrete: {
      available: 30,
      used: 25,
      wasted: 5,
      lastWeekUsed: 20,
    },
    steel: {
      available: 25,
      used: 10,
      wasted: 5,
      lastWeekUsed: 7,
    },
  },
  4: {
    // Highway Bridge
    all: {
      available: 80,
      used: 60,
      wasted: 10,
      lastWeekUsed: 50,
    },
    wood: {
      available: 10,
      used: 5,
      wasted: 2,
      lastWeekUsed: 4,
    },
    concrete: {
      available: 40,
      used: 35,
      wasted: 5,
      lastWeekUsed: 30,
    },
    steel: {
      available: 30,
      used: 20,
      wasted: 3,
      lastWeekUsed: 16,
    },
  },
}

// Chart colors - more distinct and vibrant
const chartColors = {
  available: "#4BC0C0", // Teal
  used: "#FF6384", // Pink
  wasted: "#FFCE56", // Yellow
}

export default function MaterialUsageDashboard() {
  const [selectedProject, setSelectedProject] = useState(1)
  const [selectedMaterial, setSelectedMaterial] = useState("all")
  const [showIncreaseOnly, setShowIncreaseOnly] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [increasePercentage, setIncreasePercentage] = useState(0)

  // Update chart data when filters change
  useEffect(() => {
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      updateChartData()
      setLoading(false)
    }, 800)
  }, [selectedProject, selectedMaterial, showIncreaseOnly])

  const updateChartData = () => {
    const projectData = mockMaterialData[selectedProject]
    const materialData = projectData[selectedMaterial]

    // Calculate increase percentage
    const increase = ((materialData.used - materialData.lastWeekUsed) / materialData.lastWeekUsed) * 100
    setIncreasePercentage(increase)

    // If "Increase Over Last Week" is selected and there's no increase, return empty data
    if (showIncreaseOnly && increase <= 0) {
      setChartData({
        labels: ["No increased usage"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 0,
          },
        ],
      })
      return
    }

    // Calculate total for percentages
    const total = materialData.available + materialData.used + materialData.wasted

    // Generate more detailed colors based on material type
    let colorPalette = [chartColors.available, chartColors.used, chartColors.wasted]

    // Add material-specific color variations
    if (selectedMaterial === "wood") {
      colorPalette = ["#36A2EB", "#9966FF", "#FF9F40"] // Blue, Purple, Orange
    } else if (selectedMaterial === "concrete") {
      colorPalette = ["#4BC0C0", "#FF6384", "#FFCE56"] // Teal, Pink, Yellow
    } else if (selectedMaterial === "steel") {
      colorPalette = ["#7ED2FA", "#FF8A80", "#A5D6A7"] // Light Blue, Light Red, Light Green
    }

    // Prepare chart data
    setChartData({
      labels: [
        `Available Materials: ${Math.round((materialData.available / total) * 100)}%`,
        `Used Materials: ${Math.round((materialData.used / total) * 100)}%`,
        `Wasted Materials: ${Math.round((materialData.wasted / total) * 100)}%`,
      ],
      datasets: [
        {
          data: [materialData.available, materialData.used, materialData.wasted],
          backgroundColor: colorPalette,
          borderWidth: 1,
          borderColor: "#ffffff",
        },
      ],
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Material Usage Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">Filters</h2>
              <p className="text-gray-600 text-sm">Select options to filter the chart data</p>
            </div>
            <div className="space-y-4">
              {/* Project Filter */}
              <div className="space-y-2">
                <label htmlFor="project" className="block text-sm font-medium">
                  Project
                </label>
                <select
                  id="project"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(Number.parseInt(e.target.value))}
                >
                  {mockProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Type Filter */}
              <div className="space-y-2">
                <label htmlFor="material" className="block text-sm font-medium">
                  Material Type
                </label>
                <select
                  id="material"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                >
                  <option value="all">All Materials</option>
                  <option value="wood">Wood</option>
                  <option value="concrete">Concrete</option>
                  <option value="steel">Steel</option>
                </select>
              </div>

              {/* Increase Over Last Week Filter */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="increase"
                  checked={showIncreaseOnly}
                  onChange={(e) => setShowIncreaseOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="increase" className="text-sm cursor-pointer">
                  Show only materials with increased usage
                </label>
              </div>
            </div>
          </div>

          {/* Increase Counter */}
          {increasePercentage !== 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="mb-2">
                <h2 className="text-xl font-semibold">Usage Trend</h2>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    increasePercentage > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {increasePercentage > 0 ? "↑" : "↓"} {Math.abs(increasePercentage).toFixed(1)}%
                </span>
                <span className="ml-2 text-sm">
                  {increasePercentage > 0 ? "Increase in material usage" : "Decrease in material usage"} compared to
                  last week
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Material Usage Breakdown
                {selectedMaterial !== "all" &&
                  ` - ${selectedMaterial.charAt(0).toUpperCase() + selectedMaterial.slice(1)}`}
              </h2>
              <p className="text-gray-600 text-sm">{mockProjects.find((p) => p.id === selectedProject)?.name}</p>
            </div>
            <div className="flex justify-center items-center min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-2"></div>
                  <p>Loading data...</p>
                </div>
              ) : chartData ? (
                <div className="w-full max-w-md">
                  <Pie
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 20,
                            font: {
                              size: 14,
                            },
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || ""
                              const value = context.raw || 0
                              return `${label} (${value} units)`
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

