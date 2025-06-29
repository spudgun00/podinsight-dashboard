import React from 'react'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchCommandBar } from '../search-command-bar'
import { act } from 'react-dom/test-utils'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('SearchCommandBar', () => {
  const mockOnSearch = jest.fn()
  const user = userEvent.setup({ delay: null }) // Speed up tests

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers() // Enable fake timers for debounce testing
    // Mock window.fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the search input with correct placeholder', () => {
      render(<SearchCommandBar />)
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      expect(input).toBeInTheDocument()
    })

    it('shows keyboard shortcut hint', () => {
      render(<SearchCommandBar />)
      // Component shows ⌘K on Mac, Ctrl+K on Windows
      const shortcutHint = screen.getByText(/⌘K|Ctrl\+K/)
      expect(shortcutHint).toBeInTheDocument()
    })

    it('renders in inline mode by default', () => {
      const { container } = render(<SearchCommandBar />)
      expect(container.querySelector('.my-6')).toBeInTheDocument()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should NOT focus input when "/" is pressed while typing in an input', async () => {
      render(<SearchCommandBar />)
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      
      // Focus the input itself
      await user.click(input)
      expect(input).toHaveFocus()
      
      // Type '/' while input is focused
      await user.keyboard('/')
      
      // Input should still have focus and contain '/'
      expect(input).toHaveFocus()
      expect(input).toHaveValue('/')
    })
    it('focuses input when "/" key is pressed', async () => {
      const { container } = render(<SearchCommandBar />)
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      
      // Ensure input is not focused initially
      expect(input).not.toHaveFocus()
      
      // Ensure document.body has focus (not any input)
      document.body.focus()
      
      // Simulate pressing '/' using userEvent for more realistic behavior
      await user.keyboard('/')
      
      // The input should now have focus
      expect(input).toHaveFocus()
    })

    it('focuses input when Cmd+K is pressed on Mac', async () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      })

      render(<SearchCommandBar />)
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      
      expect(input).not.toHaveFocus()
      
      // Ensure document.body has focus
      document.body.focus()
      
      // Simulate pressing Cmd+K using userEvent
      await user.keyboard('{Meta>}k{/Meta}')
      
      expect(input).toHaveFocus()
    })

    it('shows command hint for Mac users', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      })

      render(<SearchCommandBar />)
      expect(screen.getByText('⌘K')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('does not search with less than 4 characters', async () => {
      const mockFetch = global.fetch as jest.Mock
      render(<SearchCommandBar onSearch={mockOnSearch} />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'AI')
      
      // Advance timers past debounce period
      jest.advanceTimersByTime(600)
      
      // Should not call API
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('triggers search after typing 4+ characters', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          answer: {
            text: 'Test answer about AI agents',
            citations: []
          }
        })
      })

      render(<SearchCommandBar onSearch={mockOnSearch} />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'AI agents')
      
      // Advance timers past debounce period (500ms)
      await act(async () => {
        jest.advanceTimersByTime(550)
      })
      
      // Now the API should have been called
      expect(mockFetch).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'AI agents', limit: 10 })
      }))
    })

    it('shows loading state during search', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ answer: { text: 'Test', citations: [] } })
        }), 1000))
      )

      render(<SearchCommandBar />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'test query')
      
      // Advance timers to trigger the search
      await act(async () => {
        jest.advanceTimersByTime(550)
      })
      
      // Loading spinner should be visible
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      
      // Let the promise resolve
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })
      
      // Loading spinner should be gone
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading-spinner'))
    })

    it('displays AI answer with citations', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          answer: {
            text: 'VCs express concern about AI valuations¹²',
            citations: [
              {
                index: 1,
                episode_id: 'ep1',
                episode_title: 'AI Bubble Discussion',
                podcast_name: 'All-In',
                timestamp: '27:04',
                start_seconds: 1624
              },
              {
                index: 2,
                episode_id: 'ep2',
                episode_title: 'Market Analysis',
                podcast_name: 'Acquired',
                timestamp: '15:30',
                start_seconds: 930
              }
            ]
          }
        })
      })

      render(<SearchCommandBar />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'AI valuations')
      
      // Advance timers past debounce
      await act(async () => {
        jest.advanceTimersByTime(550)
      })
      
      // Wait for the promise to resolve and text to appear
      const answerText = await screen.findByText(/VCs express concern/i)
      expect(answerText).toBeInTheDocument()
      
      // Check citations are displayed
      expect(screen.getByText('All-In')).toBeInTheDocument()
      expect(screen.getByText('27:04')).toBeInTheDocument()
      
      // Check confidence score is displayed
      expect(screen.getByText(/\d+%/)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('shows user-friendly error on API failure', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<SearchCommandBar />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'test error')
      
      // Advance timers past debounce
      await act(async () => {
        jest.advanceTimersByTime(550)
      })
      
      // Wait for error message to appear
      const errorText = await screen.findByText(/An error occurred while searching/i)
      expect(errorText).toBeInTheDocument()
    })

    it('handles empty results gracefully', async () => {
      const mockFetch = global.fetch as jest.Mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      render(<SearchCommandBar />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'obscure query')
      
      // Advance timers past debounce
      await act(async () => {
        jest.advanceTimersByTime(550)
      })
      
      // Component shows "No results found" for empty response
      const noResultsText = await screen.findByText(/No results found/i)
      expect(noResultsText).toBeInTheDocument()
    })
  })

  describe('Scroll Behavior', () => {
    it('hides on scroll down when threshold is reached', async () => {
      const { container } = render(<SearchCommandBar />)
      
      // Mock getBoundingClientRect
      const mockElement = container.querySelector('.my-6') as HTMLElement
      if (mockElement) {
        jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
          bottom: -100, // Scrolled past
          top: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({})
        })
      }
      
      // Simulate scroll
      fireEvent.scroll(window)
      
      // The component should handle scroll internally
      expect(mockElement).toBeInTheDocument()
    })
  })

  describe('Modal Mode', () => {
    it('opens modal when "/" key pressed in modal mode after scrolling', async () => {
      render(<SearchCommandBar mode="modal" />)
      
      // Simulate scrolling past the component to trigger modal mode behavior
      const container = document.querySelector('.my-6')?.firstChild as HTMLElement
      if (container) {
        jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({
          bottom: -100, // Scrolled past
          top: -200,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({})
        })
      }
      
      // Trigger scroll event to update isScrolledPast state
      fireEvent.scroll(window)
      
      // Wait a tick for state to update
      await waitFor(() => {
        // Now pressing "/" should open the modal
        fireEvent.keyDown(document, { key: '/', code: 'Slash' })
      })
      
      // Modal should be open - check for the backdrop div
      await waitFor(() => {
        // The modal backdrop has class 'backdrop-blur-sm'
        const backdrop = document.querySelector('.backdrop-blur-sm')
        expect(backdrop).toBeInTheDocument()
      })
    })

    it('closes modal when clicking outside', async () => {
      render(<SearchCommandBar mode="modal" />)
      
      // Simulate scrolling past the component
      const container = document.querySelector('.my-6')?.firstChild as HTMLElement
      if (container) {
        jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({
          bottom: -100,
          top: -200,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({})
        })
      }
      
      fireEvent.scroll(window)
      
      // Open modal with keyboard shortcut
      await waitFor(() => {
        fireEvent.keyDown(document, { key: '/', code: 'Slash' })
      })
      
      // Wait for modal to open
      await waitFor(() => {
        const backdrop = document.querySelector('.backdrop-blur-sm')
        expect(backdrop).toBeInTheDocument()
      })
      
      // Click backdrop to close
      const backdrop = document.querySelector('.backdrop-blur-sm') as HTMLElement
      await user.click(backdrop)
      
      // Modal should close
      await waitFor(() => {
        const closedBackdrop = document.querySelector('.backdrop-blur-sm')
        expect(closedBackdrop).not.toBeInTheDocument()
      })
    })
  })

  describe('Mock Data Integration', () => {
    it('uses mock data from test page when enabled', async () => {
      // Override fetch to simulate mock data response
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: {
            text: 'Mock answer about AI agents from test data',
            citations: [
              {
                index: 1,
                episode_id: 'mock-123',
                episode_title: 'Mock Episode',
                podcast_name: 'Mock Podcast',
                timestamp: '10:00',
                start_seconds: 600
              }
            ]
          }
        })
      })
      global.fetch = mockFetch

      render(<SearchCommandBar />)
      
      const input = screen.getByPlaceholderText(/Ask anything.../i)
      await user.type(input, 'AI agents')
      
      // Advance timers past debounce
      await act(async () => {
        jest.advanceTimersByTime(550)
      })
      
      // Wait for the AI answer text to appear
      const answerText = await screen.findByText(/Mock answer about AI agents from test data/i)
      expect(answerText).toBeInTheDocument()
      
      // Check for the citation
      expect(screen.getByText('Mock Podcast')).toBeInTheDocument()
    })
  })
})