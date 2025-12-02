'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Star, CheckCircle, Package } from 'lucide-react'

export default function RatingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Prosím vyberte hodnotenie')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/rate-courier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, rating, comment })
      })

      const data = await res.json()
      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Nepodarilo sa odoslať hodnotenie')
      }
    } catch (err) {
      setError('Chyba pri odosielaní')
    }

    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Ďakujeme za hodnotenie!</h1>
          <p className="text-gray-600 mb-6">Vaše hodnotenie pomáha zlepšovať naše služby.</p>
          <a href="/" className="text-black underline">Späť na hlavnú stránku</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Ohodnoťte doručenie</h1>
          <p className="text-gray-600">Ako ste boli spokojní s naším kuriérom?</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating Labels */}
        <div className="text-center mb-6">
          {rating === 1 && <p className="text-red-500">Veľmi zlé</p>}
          {rating === 2 && <p className="text-orange-500">Zlé</p>}
          {rating === 3 && <p className="text-yellow-500">Priemerné</p>}
          {rating === 4 && <p className="text-lime-500">Dobré</p>}
          {rating === 5 && <p className="text-green-500">Vynikajúce!</p>}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Komentár (voliteľný)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none"
            rows={3}
            placeholder="Napíšte nám váš názor..."
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full py-4 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
        >
          {isSubmitting ? 'Odosielam...' : 'Odoslať hodnotenie'}
        </button>
      </div>
    </div>
  )
}
