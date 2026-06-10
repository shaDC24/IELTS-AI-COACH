import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { BookOpen, Send, Loader } from 'lucide-react'

export default function StudyPlan() {
  const [weeks, setWeeks] = useState(4)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeWeek, setActiveWeek] = useState(0)

  // Mentor chat
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your IELTS mentor. Ask me anything about improving your score.' }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const generatePlan = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/study-plan/generate', { weeks })
      setPlan(data)
      setActiveWeek(0)
    } catch {
      toast.error('Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setChatLoading(true)
    try {
      const { data } = await api.post('/study-plan/mentor', { question: input })
      setMessages((m) => [...m, { role: 'ai', text: data.answer }])
    } catch {
      toast.error('Mentor failed to respond')
    } finally {
      setChatLoading(false)
    }
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend']

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Study Plan & AI Mentor</h1>
      <p className="text-gray-500 mb-8">Get a personalized study plan and chat with your AI coach.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Study Plan */}
        <div>
          <div className="bg-white border rounded-2xl p-6 mb-5">
            <h2 className="font-semibold text-gray-900 mb-4">Generate Study Plan</h2>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-gray-600">Duration:</label>
              {[2, 4, 6, 8].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeeks(w)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    weeks === w
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {w} weeks
                </button>
              ))}
            </div>
            <button
              onClick={generatePlan}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><BookOpen size={16} /> Generate My Plan</>
              )}
            </button>
          </div>

          {plan && (
            <div className="bg-white border rounded-2xl p-6">
              <p className="text-sm text-gray-500 mb-4">{plan.overall_strategy}</p>

              {/* Week tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {plan.weeks.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveWeek(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      activeWeek === i
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Week {w.week}
                  </button>
                ))}
              </div>

              {/* Active week details */}
              {plan.weeks[activeWeek] && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {plan.weeks[activeWeek].theme}
                    </h3>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                      {plan.weeks[activeWeek].focus_skill}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    🎯 {plan.weeks[activeWeek].goal}
                  </p>

                  <div className="space-y-2">
                    {days.map((day) => (
                      plan.weeks[activeWeek].daily_tasks?.[day]?.length > 0 && (
                        <div key={day} className="flex gap-3">
                          <span className="text-xs font-medium text-gray-400 w-16 capitalize pt-0.5">
                            {day.slice(0, 3)}
                          </span>
                          <div className="flex-1 space-y-1">
                            {plan.weeks[activeWeek].daily_tasks[day].map((task, i) => (
                              <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  {plan.weeks[activeWeek].resources?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-400 mb-2">Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.weeks[activeWeek].resources.map((r, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Mentor Chat */}
        <div className="bg-white border rounded-2xl flex flex-col" style={{ height: '600px' }}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">AI Mentor</h2>
            <p className="text-xs text-gray-500">Ask anything about IELTS preparation</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <Loader size={14} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your IELTS mentor..."
              className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !input.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}