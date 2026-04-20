import { useState, useCallback, useEffect } from 'react'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DyslexiaText, DyslexiaCard, DyslexiaHeading } from '@/design-system'
import { apiClient } from '@/services/api'
import { SpeechToTextButton } from '@/components/common/SpeechToTextButton'

interface DiagramNode {
  id: string
  label: string
  type: string
  position: { x: number; y: number }
}

interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
  type: string
}

interface ImageStyle {
  id: string
  name: string
  description: string
  icon: string
}

interface ImageSize {
  value: string
  label: string
  icon: string
}

type TabType = 'diagram' | 'image'

export function VisualLearningPage() {
  const [activeTab, setActiveTab] = useState<TabType>('diagram')

  // Diagram state
  const [conceptName, setConceptName] = useState('')
  const [description, setDescription] = useState('')
  const [complexity, setComplexity] = useState('simple')
  const [diagram, setDiagram] = useState<{ nodes: DiagramNode[]; edges: DiagramEdge[] } | null>(null)
  const [isDiagramLoading, setIsDiagramLoading] = useState(false)

  // Image state
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('educational')
  const [selectedSize, setSelectedSize] = useState('1024x1024')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [styles, setStyles] = useState<ImageStyle[]>([])
  const [sizes, setSizes] = useState<ImageSize[]>([])

  // Initialize image options
  useEffect(() => {
    setStyles([
      { id: 'educational', name: 'Educational Diagram', description: 'Clear, labeled diagrams', icon: '📚' },
      { id: 'simple', name: 'Simple & Clean', description: 'Minimalist design', icon: '✨' },
      { id: 'detailed', name: 'Detailed', description: 'Informative with labels', icon: '📝' },
      { id: 'cartoon', name: 'Cartoon Style', description: 'Friendly illustrations', icon: '🎨' }
    ])
    setSizes([
      { value: '256x256', label: 'Small', icon: '📱' },
      { value: '512x512', label: 'Medium', icon: '📱' },
      { value: '1024x1024', label: 'Large', icon: '💻' },
      { value: '1792x1024', label: 'Wide', icon: '🖥️' }
    ])
  }, [])

  const generateDiagram = async () => {
    if (!conceptName.trim() || !description.trim()) return
    setIsDiagramLoading(true)
    try {
      const response = await apiClient.post('/diagrams/generate', {
        conceptName,
        description,
        complexity
      })
      setDiagram({
        nodes: (response.data as any)?.nodes || [],
        edges: (response.data as any)?.edges || []
      })
    } catch (error) {
      console.error('Failed to generate diagram:', error)
    } finally {
      setIsDiagramLoading(false)
    }
  }

  const generateImage = async () => {
    if (!prompt.trim()) return
    setIsImageLoading(true)
    setImageError(null)
    setImageUrl(null)
    try {
      const response = await apiClient.post('/images/generate', {
        prompt: prompt.trim(),
        style: selectedStyle,
        size: selectedSize
      })

      if (response.data?.success && response.data?.imageUrl) {
        const url = response.data.imageUrl

        // Pre-fetch the image to verify it loads
        try {
          const imgResponse = await fetch(url, { method: 'HEAD' })
          if (imgResponse.ok) {
            setImageUrl(url)
          } else {
            setImageError('Image generation service is temporarily busy. Please try again.')
          }
        } catch {
          // If pre-fetch fails, still show the URL - it might work in browser
          setImageUrl(url)
        }
      } else {
        setImageError(response.data?.error || 'Failed to generate image')
      }
    } catch (err: any) {
      setImageError(err.response?.data?.error || err.message || 'Failed to generate image')
    } finally {
      setIsImageLoading(false)
    }
  }

  const handleConceptSpeech = useCallback((text: string) => {
    setConceptName(text)
  }, [])

  const handleDescriptionSpeech = useCallback((text: string) => {
    setDescription(prev => prev ? `${prev} ${text}` : text)
  }, [])

  const handlePromptSpeech = useCallback((text: string) => {
    setPrompt(text)
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dyslexia-cream">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-dyslexia-calmBlue">
              Visual Learning
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered visual tools for dyslexic learners
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Tab Toggle */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-2 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('diagram')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                  activeTab === 'diagram'
                    ? 'bg-dyslexia-calmBlue text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Concept Diagram
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                  activeTab === 'image'
                    ? 'bg-dyslexia-calmBlue text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🎨 AI Image Generator
              </button>
            </div>
          </DyslexiaCard>

          {/* Diagram Tab */}
          {activeTab === 'diagram' && (
            <>
              <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <DyslexiaHeading level={2} size="lg" className="mb-4">
                  Generate Concept Diagram
                </DyslexiaHeading>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      Concept Name
                      <SpeechToTextButton
                        onTranscript={handleConceptSpeech}
                        className="ml-auto"
                      />
                    </label>
                    <input
                      type="text"
                      value={conceptName}
                      onChange={(e) => setConceptName(e.target.value)}
                      placeholder="e.g., Photosynthesis"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      Description
                      <SpeechToTextButton
                        onTranscript={handleDescriptionSpeech}
                        className="ml-auto"
                      />
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the concept you want to visualize..."
                      className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none resize-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Complexity Level</label>
                    <div className="flex gap-4">
                      {['simple', 'moderate', 'complex'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setComplexity(level)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors capitalize ${
                            complexity === level
                              ? 'bg-dyslexia-calmBlue text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateDiagram}
                  disabled={!conceptName.trim() || !description.trim() || isDiagramLoading}
                  className="w-full px-8 py-4 bg-dyslexia-calmBlue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isDiagramLoading ? 'Generating...' : '📊 Generate Diagram'}
                </button>
              </DyslexiaCard>

              {diagram && (
                <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6">
                  <DyslexiaHeading level={2} size="lg" className="mb-4">
                    Visual Diagram: {conceptName}
                  </DyslexiaHeading>

                  <div className="bg-dyslexia-cream rounded-xl p-6">
                    <svg width="100%" height="400" viewBox="0 0 600 400">
                      {diagram.edges.map((edge) => {
                        const source = diagram.nodes.find(n => n.id === edge.source)
                        const target = diagram.nodes.find(n => n.id === edge.target)
                        if (!source || !target) return null

                        return (
                          <g key={edge.id}>
                            <line
                              x1={source.position.x}
                              y1={source.position.y}
                              x2={target.position.x}
                              y2={target.position.y}
                              stroke="#666"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                            {edge.label && (
                              <text
                                x={(source.position.x + target.position.x) / 2}
                                y={(source.position.y + target.position.y) / 2 - 5}
                                textAnchor="middle"
                                className="text-xs fill-gray-500"
                              >
                                {edge.label}
                              </text>
                            )}
                          </g>
                        )
                      })}

                      {diagram.nodes.map((node) => (
                        <g key={node.id}>
                          <circle
                            cx={node.position.x}
                            cy={node.position.y}
                            r={node.type === 'concept' ? 40 : 30}
                            fill={node.type === 'concept' ? '#4CAF50' : '#2196F3'}
                            stroke="#2E7D32"
                            strokeWidth="2"
                          />
                          <text
                            x={node.position.x}
                            y={node.position.y + 5}
                            textAnchor="middle"
                            className="text-xs fill-white font-medium"
                          >
                            {node.label.substring(0, 8)}
                          </text>
                        </g>
                      ))}

                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="10"
                          refX="10"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill="#666" />
                        </marker>
                      </defs>
                    </svg>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {diagram.nodes.map((node) => (
                      <div key={node.id} className="p-4 bg-dyslexia-cream rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">{node.type}</div>
                        <DyslexiaText size="md" className="font-medium">
                          {node.label}
                        </DyslexiaText>
                      </div>
                    ))}
                  </div>
                </DyslexiaCard>
              )}
            </>
          )}

          {/* Image Tab */}
          {activeTab === 'image' && (
            <>
              <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <DyslexiaHeading level={2} size="lg" className="mb-4">
                  Generate AI Image
                </DyslexiaHeading>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      Describe what you want to see
                      <SpeechToTextButton
                        onTranscript={handlePromptSpeech}
                        className="ml-auto"
                      />
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A diagram showing the water cycle with labels..."
                      className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none resize-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Image Style</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {styles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedStyle === style.id
                              ? 'border-dyslexia-calmBlue bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{style.icon}</div>
                          <DyslexiaText size="sm" className="font-medium block">
                            {style.name}
                          </DyslexiaText>
                          <p className="text-xs text-gray-500 mt-1">
                            {style.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Image Size</label>
                    <div className="flex gap-3">
                      {sizes.map((size) => (
                        <button
                          key={size.value}
                          onClick={() => setSelectedSize(size.value)}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                            selectedSize === size.value
                              ? 'border-dyslexia-calmBlue bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">{size.icon}</span>
                          <span className="text-sm">{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateImage}
                  disabled={!prompt.trim() || isImageLoading}
                  className="w-full px-8 py-4 bg-dyslexia-calmBlue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImageLoading ? '🎨 Generating...' : '🎨 Generate Image'}
                </button>

                {imageError && (
                  <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
                    <p className="text-orange-800 font-medium">Oops! Something went wrong</p>
                    <p className="text-orange-700 text-sm mt-1">{imageError}</p>
                  </div>
                )}
              </DyslexiaCard>

              {imageUrl && (
                <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <DyslexiaHeading level={2} size="lg" className="mb-4">
                    Your Generated Image
                  </DyslexiaHeading>

                  <div className="bg-dyslexia-cream rounded-xl p-4">
                    <img
                      src={imageUrl}
                      alt="AI generated educational image"
                      className="w-full rounded-lg shadow-md"
                      onError={(e) => {
                        setImageError('Image failed to load. The service might be busy. Click the link below to try opening directly.')
                        e.currentTarget.style.display = 'none'
                      }}
                      onLoad={(e) => {
                        setImageError(null)
                        e.currentTarget.style.display = 'block'
                      }}
                    />
                    {imageError && imageUrl && (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">{imageError}</p>
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-3 bg-dyslexia-calmBlue text-white rounded-lg font-medium hover:bg-blue-600"
                        >
                          🔗 Open Image in New Tab
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <a
                      href={imageUrl}
                      download="neurovidya-generated-image.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-dyslexia-calmBlue text-white rounded-lg font-medium hover:bg-blue-600 text-center"
                    >
                      📥 Download
                    </a>
                    <button
                      onClick={() => {
                        setImageUrl(null)
                        setPrompt('')
                        setImageError(null)
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    >
                      🔄 New Image
                    </button>
                  </div>
                </DyslexiaCard>
              )}

              {/* Example Prompts */}
              <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6">
                <DyslexiaHeading level={2} size="lg" className="mb-4">
                  Try These Examples
                </DyslexiaHeading>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Water Cycle", prompt: "A simple diagram showing the water cycle with labels for evaporation, condensation, and precipitation", icon: "💧" },
                    { title: "Photosynthesis", prompt: "Educational diagram of a plant leaf showing how sunlight, water, and carbon dioxide create oxygen and sugar", icon: "🌱" },
                    { title: "Solar System", prompt: "Simple diagram showing the sun at the center and planets orbiting around it with labels", icon: "🪐" },
                    { title: "Food Chain", prompt: "Educational diagram showing grass → rabbit → fox with arrows and labels", icon: "🌿" }
                  ].map((example) => (
                    <button
                      key={example.title}
                      onClick={() => setPrompt(example.prompt)}
                      className="p-4 bg-dyslexia-cream rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{example.icon}</span>
                        <DyslexiaText size="md" className="font-semibold">
                          {example.title}
                        </DyslexiaText>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {example.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </DyslexiaCard>
            </>
          )}

          {/* Info Card */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <DyslexiaHeading level={2} size="lg" className="mb-4">
              Why Visual Learning Helps
            </DyslexiaHeading>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🧠</div>
                <DyslexiaHeading level={3} size="md" className="mb-2">
                  Visual Processing
                </DyslexiaHeading>
                <p className="text-gray-600 text-sm">
                  See concepts instead of reading about them
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <DyslexiaHeading level={3} size="md" className="mb-2">
                  Color & Style
                </DyslexiaHeading>
                <p className="text-gray-600 text-sm">
                  Choose your preferred learning style
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <DyslexiaHeading level={3} size="md" className="mb-2">
                  Educational Focus
                </DyslexiaHeading>
                <p className="text-gray-600 text-sm">
                  Optimized for dyslexic learners
                </p>
              </div>
            </div>
          </DyslexiaCard>
        </main>
      </div>
    </ProtectedRoute>
  )
}
