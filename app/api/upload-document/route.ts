import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const phone = formData.get('phone') as string

    if (!file || !type || !phone) {
      return NextResponse.json({ error: 'Chýbajúce údaje' }, { status: 400 })
    }

    const timestamp = Date.now()
    const cleanPhone = phone.replace(/\+/g, '')
    const ext = file.name.split('.').pop()
    const filename = `${cleanPhone}/${type}_${timestamp}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filename)

    return NextResponse.json({ 
      success: true, 
      path: data.path,
      url: urlData.publicUrl 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload zlyhal' }, { status: 500 })
  }
}
