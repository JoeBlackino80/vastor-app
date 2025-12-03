'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.back()} 
      className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  )
}
