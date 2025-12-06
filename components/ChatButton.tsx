'use client'
import { MessageCircle } from 'lucide-react'

export default function ChatButton() {
  const phone = '421909199991'
  const message = encodeURIComponent('Dobrý deň, mám otázku ohľadom doručenia.')
  
  return (
    <a
      href={"https://wa.me/421909199991?text=Dobr%C3%BD%20de%C5%88%2C%20m%C3%A1m%20ot%C3%A1zku%20oh%C4%BEadom%20doru%C4%8Denia."}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
      aria-label="Chat na WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  )
}
