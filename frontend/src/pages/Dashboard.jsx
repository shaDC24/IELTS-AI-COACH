import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import { FileText, Mic, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)

  const cards = [
    {
      title: 'Writing Coach',
      desc: 'Get band scores and corrections on your essays',
      icon: FileText,
      to: '/writing',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Speaking Coach',
      desc: 'Record yourself and get fluency feedback',
      icon: Mic,
      to: '/speaking',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Progress',
      desc: 'Track your band score improvement over time',
      icon: TrendingUp,
      to: '/progress',
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-500 mt-1">What would you like to practice today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ title, desc, icon: Icon, to, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-2xl border p-6 hover:shadow-md transition group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}