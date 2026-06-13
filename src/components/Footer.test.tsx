import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from './Footer'
import { dbService } from '@/lib/db'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock dbService
vi.mock('@/lib/db', () => ({
  dbService: {
    insertLead: vi.fn().mockResolvedValue({ id: 'lead-test', status: 'new' })
  }
}))

describe('Footer Component', () => {
  it('renders brand heading and layout links', () => {
    render(<Footer />)
    
    // Check brand name exists
    const brandHeading = screen.getByText('SANGLI CERAMICA')
    expect(brandHeading).toBeInTheDocument()

    // Check brand description
    expect(screen.getByText('We bring beauty, durability, and innovation together to create premium ceramic and vitrified tiles for elite spaces, architects, and high-end residential designs.')).toBeInTheDocument()
  })

  it('submits newsletter subscription successfully', async () => {
    render(<Footer />)
    
    const emailInput = screen.getByPlaceholderText('Your email address')
    const subscribeButton = screen.getByRole('button')
    
    // Enter email and click subscribe
    fireEvent.change(emailInput, { target: { value: 'newsletter@customer.com' } })
    fireEvent.click(subscribeButton)
    
    // Wait for the lead insertion to be called
    await waitFor(() => {
      expect(dbService.insertLead).toHaveBeenCalledWith({
        type: 'contact',
        name: 'Newsletter Subscriber',
        email: 'newsletter@customer.com',
        phone: 'N/A',
        message: 'Subscribed to newsletter from footer',
        status: 'new'
      })
    })

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Thank you for subscribing!')).toBeInTheDocument()
    })
  })
})
