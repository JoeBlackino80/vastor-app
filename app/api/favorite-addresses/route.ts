import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customer_id = searchParams.get('customer_id')

  const { data, error } = await (supabase.from('favorite_addresses') as any)
    .select('*')
    .eq('customer_id', customer_id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  return NextResponse.json({ addresses: data || [] })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // If setting as default, unset others
    if (body.is_default) {
      await (supabase.from('favorite_addresses') as any)
        .update({ is_default: false })
        .eq('customer_id', body.customer_id)
    }

    const { data, error } = await (supabase.from('favorite_addresses') as any)
      .insert({
        customer_id: body.customer_id,
        name: body.name,
        address: body.address,
        notes: body.notes,
        is_default: body.is_default
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, address: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (body.is_default) {
      await (supabase.from('favorite_addresses') as any)
        .update({ is_default: false })
        .eq('customer_id', body.customer_id)
    }

    const { error } = await (supabase.from('favorite_addresses') as any)
      .update({ name: body.name, address: body.address, notes: body.notes, is_default: body.is_default })
      .eq('id', body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { error } = await (supabase.from('favorite_addresses') as any)
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
