'use client';
import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Bot, Copy, ThumbsUp, ThumbsDown, RefreshCw, Zap } from "lucide-react";

// Function to format response text with proper HTML rendering
function formatResponse(text: string): string {
  if (!text) return '';
  
  let formatted = text
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert __underline__ to <u>
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // Convert `inline code` to <code>
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Convert ```code blocks``` to <pre><code>
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
    // Convert line breaks to <br>
    .replace(/\n/g, '<br>')
    // Convert [link text](url) to <a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    // Convert numbered lists (1. item)
    .replace(/^(\d+)\.\s(.+)$/gm, '<div class="ml-4 mb-2"><span class="font-semibold text-blue-600">$1.</span> $2</div>')
    // Convert bullet points (- item or * item)
    .replace(/^[-*]\s(.+)$/gm, '<div class="ml-4 mb-2 flex items-start"><span class="text-blue-600 mr-2">•</span><span>$1</span></div>')
    // Convert ### headers
    .replace(/^###\s(.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
    // Convert ## headers
    .replace(/^##\s(.+)$/gm, '<h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h2>')
    // Convert # headers
    .replace(/^#\s(.+)$/gm, '<h1 class="text-2xl font-bold text-gray-800 mt-6 mb-4">$1</h1>')
    // Convert > blockquotes
    .replace(/^>\s(.+)$/gm, '<blockquote class="border-l-4 border-blue-200 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">$1</blockquote>')
    // Convert horizontal rules ---
    .replace(/^---$/gm, '<hr class="border-gray-300 my-6">')
    // Convert tables (basic support)
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      return '<div class="table-row flex border-b border-gray-200">' + 
        cells.map((cell: string) => `<div class="table-cell flex-1 p-2 border-r border-gray-200 last:border-r-0">${cell}</div>`).join('') + 
        '</div>';
    });

  // Wrap consecutive table rows in a table container
  formatted = formatted.replace(/((<div class="table-row[^>]*>.*?<\/div>\s*)+)/g, 
    '<div class="table-container border border-gray-200 rounded-lg my-4 overflow-hidden">$1</div>');

  return formatted;
}

const BOTS = [
  { id: "openai", name: "ChatGPT", color: "bg-green-500", icon: "🤖" },
  { id: "claude", name: "Claude AI", color: "bg-orange-500", icon: "🧠" },
  { id: "gemini", name: "Gemini AI", color: "bg-blue-500", icon: "✨" },
];

interface ChatBotCardProps {
  name: string;
  response: string;
  isLoading: boolean;
  color: string;
  icon: string;
  onCopy: () => void;
  onRate: (rating: 'up' | 'down') => void;
  onRegenerate: () => void;
}

function ChatBotCard({ name, response, isLoading, color, icon, onCopy, onRate, onRegenerate }: ChatBotCardProps) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleRate = (type: 'up' | 'down') => {
    setRating(type);
    onRate(type);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`${color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-lg">{name}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Regenerate response"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        ) : response ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700 leading-relaxed formatted-response"
                dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
              />
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRate('up')}
                  className={`p-2 rounded-lg transition-colors ${
                    rating === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  onClick={() => handleRate('down')}
                  className={`p-2 rounded-lg transition-colors ${
                    rating === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Copy size={14} />
                {showCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <div className="text-center">
              <Bot size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Response will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedBots, setSelectedBots] = useState<string[]>(BOTS.map(bot => bot.id));
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a creative story about space exploration",
    "Help me plan a healthy meal for the week",
    "Compare different programming languages",
    "Explain the benefits of renewable energy",
    "Create a workout routine for beginners"
  ];

  useEffect(() => {
    // Remove localStorage usage as it's not supported in Claude artifacts
    // In a real implementation, you would use localStorage here
    // const saved = localStorage.getItem('searchHistory');
    // if (saved) {
    //   setSearchHistory(JSON.parse(saved));
    // }
  }, []);

  function toggleBot(botId: string) {
    setSelectedBots(prev =>
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    );
  }

  function selectAllBots() {
    setSelectedBots(BOTS.map(bot => bot.id));
  }

  function clearSelection() {
    setSelectedBots([]);
  }

  async function handleSubmit() {
    if (selectedBots.length === 0) {
      alert("Select at least one AI model.");
      return;
    }
    
    if (prompt.trim() === "") {
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    const resObj: Record<string, string> = {};
    
    // Add to search history (in-memory only for artifact)
    const newHistory = [prompt, ...searchHistory.filter(h => h !== prompt)].slice(0, 10);
    setSearchHistory(newHistory);
    // In real implementation: localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Make actual API calls to your backend
    await Promise.all(selectedBots.map(async (botId) => {
      try {
        const response = await fetch("/api/queryBot", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bot: botId, prompt }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        resObj[botId] = data.response || "Response not available";
      } catch (error) {
        console.error(`Error fetching response from ${botId}:`, error);
        // Fallback to demo response if API fails
        const demoResponses = {
          openai: `# ChatGPT Response\n\n**Question:** "${prompt}"\n\nThis is a **demo response** from ChatGPT. Your API endpoint returned an error.\n\n## Features:\n- *Formatted text* rendering\n- **Bold** and *italic* support\n- \`Code highlighting\`\n- Lists and more\n\n> Replace this with your actual API integration.`,
          claude: `# Claude AI Response\n\n**Your Question:** "${prompt}"\n\nThis is a **demo response** from Claude AI. Check your API configuration.\n\n### Key Points:\n1. **API Integration** needed\n2. *Error handling* implemented\n3. **Formatting** works correctly\n\n\`\`\`javascript\n// Your API call should work like this\nconst response = await fetch('/api/queryBot', {\n  method: 'POST',\n  body: JSON.stringify({ bot: 'claude', prompt })\n});\n\`\`\``,
          gemini: `# Gemini AI Response\n\n**Query:** "${prompt}"\n\n**Demo Mode Active** - Your API returned an error.\n\n## What's Working:\n- ✅ *Text formatting*\n- ✅ **Bold and italic**\n- ✅ \`Code blocks\`\n- ✅ Lists and structure\n\n### Next Steps:\n1. Check your \`/api/queryBot\` endpoint\n2. Verify API keys and configuration\n3. Test individual bot integrations\n\n> This demo shows how responses will be formatted once your API is working.`,
        };
        resObj[botId] = demoResponses[botId as keyof typeof demoResponses] || "Error: Could not fetch response";
      }
    }));

    setResponses(resObj);
    setLoading(false);
    setShowSuggestions(false);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function useSuggestion(suggestion: string) {
    setPrompt(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function useHistoryItem(item: string) {
    setPrompt(item);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function copyResponse(response: string) {
    // Strip HTML tags for copying
    const textContent = response.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    navigator.clipboard.writeText(textContent);
  }

  function rateResponse(botId: string, rating: 'up' | 'down') {
    console.log(`Rated ${botId} as ${rating}`);
    // Implement rating logic here - could send to your analytics endpoint
  }

  async function regenerateResponse(botId: string) {
    console.log(`Regenerating response for ${botId}`);
    setLoading(true);
  
    try {
      const res = await fetch("/api/queryBot", {
        method: "POST",
        body: JSON.stringify({ bot: botId, prompt }),
      });
  
      const data = await res.json();
  
      setResponses(prev => ({
        ...prev,
        [botId]: data.response,
      }));
    } catch (err) {
      console.error("Error regenerating response:", err);
      alert("Failed to regenerate response. Please try again.");
    }
  
    setLoading(false);
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Bot Search
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Compare responses from multiple AI models instantly</p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none transition-colors text-lg"
                  placeholder="Ask your question or describe what you need help with..."
                  rows={3}
                />
                <Search className="absolute right-4 top-4 text-gray-400" size={20} />
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || prompt.trim() === "" || selectedBots.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10 max-h-80 overflow-y-auto">
                {searchHistory.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-2">Recent Searches</h4>
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => useHistoryItem(item)}
                        className="block w-full text-left p-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Suggestions</h4>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="block w-full text-left p-2 hover:bg-gray-50 rounded-lg text-gray-600 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bot Selection */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-700">Select AI Models:</p>
              <div className="flex gap-2">
                <button
                  onClick={selectAllBots}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {BOTS.map((bot) => (
                <label
                  key={bot.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedBots.includes(bot.id)
                      ? `${bot.color} text-white border-transparent shadow-lg scale-105`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBots.includes(bot.id)}
                    onChange={() => toggleBot(bot.id)}
                    className="sr-only"
                  />
                  <span className="text-xl">{bot.icon}</span>
                  <span className="font-medium">{bot.name}</span>
                </label>
              ))}
            </div>
            
            {selectedBots.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Please select at least one AI model</p>
            )}
          </div>
        </div>

        {/* Results */}
        {(loading || Object.keys(responses).length > 0) && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {selectedBots.map((botId) => {
              const bot = BOTS.find(b => b.id === botId);
              return (
                <ChatBotCard
                  key={botId}
                  name={bot?.name || botId}
                  response={responses[botId] || ""}
                  isLoading={loading && !responses[botId]}
                  color={bot?.color || "bg-gray-500"}
                  icon={bot?.icon || "🤖"}
                  onCopy={() => copyResponse(responses[botId])}
                  onRate={(rating) => rateResponse(botId, rating)}
                  onRegenerate={() => regenerateResponse(botId)}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && Object.keys(responses).length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
              <Bot size={64} className="text-blue-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Search</h3>
            <p className="text-gray-600 mb-6">Enter your question above and select AI models to compare their responses</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestion(suggestion)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom CSS for formatted responses */}
        <style jsx>{`
          .formatted-response h1, .formatted-response h2, .formatted-response h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .formatted-response h1:first-child, 
          .formatted-response h2:first-child, 
          .formatted-response h3:first-child {
            margin-top: 0;
          }
          .formatted-response pre {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
          }
          .formatted-response code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }
          .formatted-response blockquote {
            font-style: italic;
          }
          .formatted-response .table-container {
            font-size: 0.875rem;
          }
          .formatted-response a {
            transition: color 0.2s ease;
          }
          .formatted-response a:hover {
            text-decoration: underline;
          }
        `}</style>
      </main>
    </div>
  );
}