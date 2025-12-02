import { z } from 'zod'

export const courierSchema = z.object({
  first_name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  last_name: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().regex(/^(\+420)?[0-9]{9}$/, 'Neplatné telefonní číslo'),
  vehicle_type: z.enum(['bike', 'scooter', 'car'], {
    required_error: 'Vyberte typ vozidla',
  }),
  agree_terms: z.literal(true, {
    errorMap: () => ({ message: 'Musíte souhlasit s podmínkami' }),
  }),
})

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  customer_email: z.string().email('Neplatný email'),
  customer_phone: z.string().regex(/^(\+420)?[0-9]{9}$/, 'Neplatné telefonní číslo'),
  pickup_address: z.string().min(5, 'Zadejte platnou adresu'),
  pickup_notes: z.string().optional(),
  delivery_address: z.string().min(5, 'Zadejte platnou adresu'),
  delivery_notes: z.string().optional(),
  package_type: z.enum(['document', 'small_package', 'medium_package', 'large_package'], {
    required_error: 'Vyberte typ zásilky',
  }),
  service_type: z.enum(['standard', 'express', 'premium'], {
    required_error: 'Vyberte typ služby',
  }),
})

export type CourierFormData = z.infer<typeof courierSchema>
export type OrderFormData = z.infer<typeof orderSchema>

// Cenová kalkulace
export const PRICES = {
  service: {
    standard: 89,
    express: 149,
    premium: 249,
  },
  package: {
    document: 0,
    small_package: 20,
    medium_package: 50,
    large_package: 100,
  },
}

export function calculatePrice(serviceType: keyof typeof PRICES.service, packageType: keyof typeof PRICES.package): number {
  return PRICES.service[serviceType] + PRICES.package[packageType]
}
