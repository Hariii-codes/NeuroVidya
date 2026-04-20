import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DyslexiaText, DyslexiaCard, DyslexiaHeading } from '@/design-system'
import { apiClient } from '@/services/api'
import { SpeechToTextButton } from '@/components/common/SpeechToTextButton'

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

export function AIImagePage() {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('educational')
  const [selectedSize, setSelectedSize] = useState('1024x1024')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [styles, setStyles] = useState<ImageStyle[]>([])
  const [sizes, setSizes] = useState<ImageSize[]>([])

  // Load available styles and sizes on mount
  useEffect(() => {
    // Set default styles
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

  const generateImage = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      const response = await apiClient.post('/images/generate', {
        prompt: prompt.trim(),
        style: selectedStyle,
        size: selectedSize
      })

      if (response.data?.success && response.data?.imageUrl) {
        setImageUrl(response.data.imageUrl)
      } else {
        setError(response.data?.error || 'Failed to generate image')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to generate image')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSpeech = (text: string) => {
    setPrompt(text)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-dyslexia-cream">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-dyslexia-calmBlue">
              AI Image Generator
            </h1>
            <p className="text-gray-600 mt-1">
              Create visual learning images with AI
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Image Generator */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <DyslexiaHeading level={2} size="lg" className="mb-4">
              Generate AI Image
            </DyslexiaHeading>

            <div className="space-y-4 mb-6">
              {/* Prompt Input */}
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
                  placeholder="e.g., A diagram showing how water changes from ice to water to steam with labels..."
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-dyslexia-calmBlue focus:outline-none resize-none text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Describe any concept - science, history, math, or anything you're learning
                </p>
              </div>

              {/* Style Selection */}
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

              {/* Size Selection */}
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
              disabled={!prompt.trim() || isLoading}
              className="w-full px-8 py-4 bg-dyslexia-calmBlue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🎨 Generating Image...' : '🎨 Generate Image'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
                <p className="text-orange-800 font-medium">Oops! Something went wrong</p>
                <p className="text-orange-700 text-sm mt-1">{error}</p>
                <p className="text-orange-600 text-xs mt-2">
                  Tip: Make sure the OpenAI API key is configured in the backend .env file
                </p>
              </div>
            )}
          </DyslexiaCard>

          {/* Generated Image Display */}
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
                  onError={() => setError('Failed to load the image')}
                />
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href={imageUrl}
                  download="neurovidya-generated-image.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-dyslexia-calmBlue text-white rounded-lg font-medium hover:bg-blue-600 text-center"
                >
                  📥 Download Image
                </a>
                <button
                  onClick={() => {
                    setImageUrl(null)
                    setPrompt('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  🔄 Generate Another
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
                {
                  title: "Water Cycle",
                  prompt: "A simple diagram showing the water cycle with labels for evaporation, condensation, and precipitation",
                  icon: "💧"
                },
                {
                  title: "Photosynthesis",
                  prompt: "Educational diagram of a plant leaf showing how sunlight, water, and carbon dioxide create oxygen and sugar",
                  icon: "🌱"
                },
                {
                  title: "Solar System",
                  prompt: "Simple diagram showing the sun at the center and planets orbiting around it with labels",
                  icon: "🪐"
                },
                {
                  title: "Food Chain",
                  prompt: "Educational diagram showing grass → rabbit → fox with arrows and labels",
                  icon: "🌿"
                }
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

          {/* Features Info */}
          <DyslexiaCard className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <DyslexiaHeading level={2} size="lg" className="mb-4">
              Why AI Images Help Dyslexic Learners
            </DyslexiaHeading>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🧠</div>
                <DyslexiaHeading level={3} size="md" className="mb-2">
                  Visual Learning
                </DyslexiaHeading>
                <p className="text-gray-600 text-sm">
                  See concepts instead of reading about them
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <DyslexiaHeading level={3} size="md" className="mb-2">
                  Customizable Styles
                </DyslexiaHeading>
                <p className="text-gray-600 text-sm">
                  Choose simple or detailed styles
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <DyslexiaHeading level={3} size="md" className="mb-2">
                  Educational Focus
                </DyslexiaHeading>
                <p className="text-gray-600 text-sm">
                  Optimized for learning with clear labels
                </p>
              </div>
            </div>
          </DyslexiaCard>
        </main>
      </div>
    </ProtectedRoute>
  )
}
