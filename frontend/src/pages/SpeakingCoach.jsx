import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Mic, MicOff, RotateCcw } from 'lucide-react'

export default function SpeakingCoach() {
  const [question, setQuestion] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    fetchQuestion()
  }, [])

  const fetchQuestion = async () => {
    setResult(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setTimer(0)
    try {
      const { data } = await api.get('/speaking/question')
      setQuestion(data.question)
    } catch {
      toast.error('Failed to load question')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorder.start()
      setRecording(true)

      // Timer
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t >= 120) {
            stopRecording()
            return t
          }
          return t + 1
        })
      }, 1000)
    } catch(err) {
    console.error('Mic error:', err.name, err.message)
    if (err.name === 'NotAllowedError') {
      toast.error('Microphone permission denied. Please allow microphone access in browser settings.')
    } else if (err.name === 'NotFoundError') {
      toast.error('No microphone found. Please connect a microphone.')
    } else {
      toast.error(`Microphone error: ${err.message}`)
    }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const submitAudio = async () => {
    if (!audioBlob) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('question', question)

      const { data } = await api.post('/speaking/evaluate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch {
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

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Speaking Coach</h1>
      <p className="text-gray-500 mb-8">Answer the question below, then get AI feedback on your response.</p>

      {/* Question card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
        <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-2">Your question</p>
        <p className="text-lg font-medium text-gray-900">{question || 'Loading...'}</p>
        <button
          onClick={fetchQuestion}
          className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition"
        >
          <RotateCcw size={14} /> New question
        </button>
      </div>

      {/* Recording controls */}
      <div className="bg-white border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-700">
            {recording ? 'Recording...' : audioBlob ? 'Recording complete' : 'Ready to record'}
          </p>
          {(recording || audioBlob) && (
            <span className={`text-sm font-mono ${recording ? 'text-red-500' : 'text-gray-500'}`}>
              {formatTime(timer)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!recording && !audioBlob && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              <Mic size={18} /> Start Recording
            </button>
          )}

          {recording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium"
            >
              <MicOff size={18} /> Stop Recording
            </button>
          )}

          {audioBlob && !recording && (
            <>
              <button
                onClick={submitAudio}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? 'Evaluating...' : 'Get Feedback'}
              </button>
              <button
                onClick={() => { setAudioBlob(null); setAudioUrl(null); setTimer(0); setResult(null) }}
                className="px-4 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Re-record
              </button>
            </>
          )}
        </div>

        {audioUrl && (
          <audio controls src={audioUrl} className="mt-4 w-full" />
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Transcript */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Transcript</p>
            <p className="text-sm text-gray-700">{result.transcript}</p>
          </div>

          {/* Band scores */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Fluency', result.fluency_coherence],
              ['Grammar', result.grammatical_range],
              ['Vocabulary', result.lexical_resource],
              ['Pronunciation', result.pronunciation],
              ['Overall', result.overall_band],
            ].map(([label, score]) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm border text-center">
                <div className={`text-3xl font-bold ${bandColor(score)}`}>{score}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Fluency feedback */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Feedback</p>
            <p className="text-sm text-gray-600">{result.fluency_feedback}</p>
          </div>

          {/* Grammar mistakes */}
          {result.grammar_mistakes?.length > 0 && (
            <div className="bg-red-50 rounded-2xl p-5">
              <p className="text-sm font-semibold text-red-700 mb-3">Grammar Corrections</p>
              <div className="space-y-2">
                {result.grammar_mistakes.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="line-through text-red-400">{m.original}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-green-600 font-medium">{m.corrected}</span>
                    <span className="text-gray-400 ml-2">({m.explanation})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model answer */}
          {result.model_answer && (
            <div className="bg-green-50 rounded-2xl p-5">
              <p className="text-sm font-semibold text-green-700 mb-2">Model Answer</p>
              <p className="text-sm text-gray-700">{result.model_answer}</p>
            </div>
          )}

          {/* Follow-up */}
          {result.follow_up_question && (
            <div className="bg-indigo-50 rounded-2xl p-5">
              <p className="text-sm font-semibold text-indigo-700 mb-2">Follow-up Question</p>
              <p className="text-sm text-gray-700">{result.follow_up_question}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}