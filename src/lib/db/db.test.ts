import { describe, it, expect, beforeEach } from 'vitest'
import { dbService } from './index'

describe('dbService Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('Products', () => {
    it('should retrieve seeded mock products by default', async () => {
      const products = await dbService.getProducts()
      expect(products).toBeInstanceOf(Array)
      expect(products.length).toBeGreaterThan(0)
      
      const firstProduct = products[0]
      expect(firstProduct).toHaveProperty('id')
      expect(firstProduct).toHaveProperty('name')
      expect(firstProduct).toHaveProperty('sku')
    })

    it('should filter products by search query', async () => {
      const results = await dbService.getProducts('Calacatta')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toContain('Calacatta')
    })

    it('should retrieve a product by ID or slug', async () => {
      const products = await dbService.getProducts()
      const first = products[0]
      
      const found = await dbService.getProductById(first.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(first.id)
    })
  })

  describe('Division Categories', () => {
    it('should retrieve all division categories by default', async () => {
      const categories = await dbService.getDivisionCategories()
      expect(categories.length).toBe(18)
    })

    it('should filter categories by page slug', async () => {
      const tilesCats = await dbService.getDivisionCategories('tiles')
      expect(tilesCats.length).toBe(6)
      tilesCats.forEach(c => expect(c.page_slug).toBe('tiles'))
    })
  })

  describe('Leads & Pipeline', () => {
    it('should insert a new lead successfully and save it in localStorage', async () => {
      const leadPayload = {
        type: 'quote' as const,
        name: 'Test Customer',
        email: 'test@customer.com',
        phone: '1234567890',
        message: 'I would like a quote for Calacatta slabs.',
        status: 'new' as const
      }

      const created = await dbService.insertLead(leadPayload)
      expect(created).toBeDefined()
      expect(created?.name).toBe('Test Customer')
      expect(created?.id).toContain('lead-')
      expect(created?.created_at).toBeDefined()

      // Verify it is saved in localStorage
      const leads = await dbService.getLeads()
      expect(leads.length).toBe(1)
      expect(leads[0].name).toBe('Test Customer')
    })

    it('should update lead status and notes in pipeline', async () => {
      const created = await dbService.insertLead({
        type: 'contact',
        name: 'Jane Doe',
        phone: '9876543210',
        status: 'new'
      })
      expect(created).toBeDefined()

      const success = await dbService.updateLeadStatus(created!.id, 'contacted', 'Customer called back and requested details.')
      expect(success).toBe(true)

      const leads = await dbService.getLeads()
      const updated = leads.find(l => l.id === created!.id)
      expect(updated).toBeDefined()
      expect(updated?.status).toBe('contacted')
      expect(updated?.notes).toBe('Customer called back and requested details.')
    })

    it('should delete a lead successfully from the pipeline', async () => {
      const created = await dbService.insertLead({
        type: 'contact',
        name: 'Jane Doe to Delete',
        phone: '9876543210',
        status: 'new'
      })
      expect(created).toBeDefined()

      let leads = await dbService.getLeads()
      expect(leads.some(l => l.id === created!.id)).toBe(true)

      const result = await dbService.deleteLead(created!.id)
      expect(result.success).toBe(true)

      leads = await dbService.getLeads()
      expect(leads.some(l => l.id === created!.id)).toBe(false)
    })
  })
})
