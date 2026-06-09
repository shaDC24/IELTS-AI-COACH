import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function WritingCoach() {
  const [essay, setEssay] = useState('')
  const [taskType, setTaskType] = useState('task2')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const evaluate = async () => {
    if (essay.trim().length < 100) {
      toast.error('Essay must be at least 100 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/writing/evaluate', { essay, task_type: taskType })
      setResult(data)
    } catch (err) {
      toast.error('Evaluation failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const bandColor = (score) => {
    if (score >= 7) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-500'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Writing Coach</h1>

      <div className="flex gap-4 mb-4">
        {['task1', 'task2'].map((t) => (
          <button
            key={t}
            onClick={() => setTaskType(t)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              taskType === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t === 'task1' ? 'Task 1 (Graph/Chart)' : 'Task 2 (Essay)'}
          </button>
        ))}
      </div>

      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder={taskType === 'task1' ? 'Describe the graph/chart...' : 'Write your essay here...'}
        className="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
      <div className="flex justify-between items-center mt-2 mb-4">
        <span className="text-sm text-gray-500">{essay.split(/\s+/).filter(Boolean).length} words</span>
        <button
          onClick={evaluate}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Evaluating...' : 'Evaluate Essay'}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-6">
          {/* Band scores */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              ['Task Response', result.task_response],
              ['Coherence', result.coherence_cohesion],
              ['Vocabulary', result.lexical_resource],
              ['Grammar', result.grammatical_range],
              ['Overall', result.overall_band],
            ].map(([label, score]) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <div className={`text-3xl font-bold ${bandColor(score)}`}>{score}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Grammar mistakes */}
          {result.grammar_mistakes?.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-semibold text-red-700 mb-3">Grammar Corrections</h3>
              <div className="space-y-2">
                {result.grammar_mistakes.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="line-through text-red-500">{m.original}</span>
                    <span className="mx-2">→</span>
                    <span className="text-green-600 font-medium">{m.corrected}</span>
                    <span className="text-gray-500 ml-2">({m.explanation})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary */}
          {result.vocabulary_suggestions?.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-700 mb-3">Vocabulary Upgrades</h3>
              <div className="flex flex-wrap gap-2">
                {result.vocabulary_suggestions.map((v, i) => (
                  <span key={i} className="text-sm bg-white px-3 py-1 rounded-full border">
                    <span className="text-gray-500">{v.basic_word}</span>
                    <span className="mx-1">→</span>
                    <span className="text-blue-600 font-medium">{v.better_word}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improved essay */}
          {result.improved_essay && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-700 mb-2">Improved Version</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.improved_essay}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}