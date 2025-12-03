import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const order_id = formData.get('order_id') as string

    if (!file || !order_id) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileName = `delivery_${order_id}_${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('delivery-photos')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('delivery-photos')
      .getPublicUrl(fileName)

    // Update order with photo URL
    await (supabase.from('orders') as any)
      .update({ 
        delivery_photo_url: urlData.publicUrl,
        delivered_at: new Date().toISOString()
      })
      .eq('id', order_id)

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
