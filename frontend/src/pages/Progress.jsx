import { useState, useEffect } from 'react'
import api from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, FileText, Mic } from 'lucide-react'

export default function Progress() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/progress/summary')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 text-center text-gray-400">Loading progress...</div>
  )

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Progress Tracker</h1>
      <p className="text-gray-500 mb-8">Track your band score improvement over time.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Writing Sessions', value: data?.total_writing_sessions || 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg Writing Band', value: data?.avg_writing_band || '—', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Speaking Sessions', value: data?.total_speaking_sessions || 0, icon: Mic, color: 'text-purple-600 bg-purple-50' },
          { label: 'Avg Speaking Band', value: data?.avg_speaking_band || '—', icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Writing chart */}
      {data?.writing_scores?.length > 0 && (
        <div className="bg-white border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Writing Band History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.writing_scores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 9]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2} name="Overall" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="task_response" stroke="#10b981" strokeWidth={1.5} name="Task Response" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="coherence" stroke="#f59e0b" strokeWidth={1.5} name="Coherence" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Speaking chart */}
      {data?.speaking_scores?.length > 0 && (
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Speaking Band History</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.speaking_scores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 9]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="#8b5cf6" strokeWidth={2} name="Overall" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="fluency" stroke="#06b6d4" strokeWidth={1.5} name="Fluency" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="vocabulary" stroke="#f43f5e" strokeWidth={1.5} name="Vocabulary" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state */}
      {!data?.writing_scores?.length && !data?.speaking_scores?.length && (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <TrendingUp size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No data yet. Complete some writing or speaking sessions to see your progress.</p>
        </div>
      )}
    </div>
  )
}