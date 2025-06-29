# Updated Sprint 3 Testing Plan - Chrome MVP Focus

## Overview
This updated testing plan focuses on Chrome browser compatibility only for the MVP launch. Cross-browser and mobile testing are deferred to post-launch phases.

## Testing Requirements (Chrome-only MVP)

### 1. Component Tests (audio-player.test.tsx)
- Test all state transitions (loading, playing, paused, error)
- Mock API calls for audio clip generation
- Test keyboard interactions (space to play/pause)
- Test concurrent playback handling (only one audio at a time)

### 2. Component Tests (CommandBar.test.tsx)
- Test keyboard shortcuts (/, ⌘K, ESC)
- Test scroll hide/show behavior
- Test background blur effect
- Mock API responses for search
- Test loading states and error handling

### 3. Integration Tests (command-bar.cy.ts)
- Full user flow: open → search → view answer
- Audio playback interaction
- Chrome desktop viewport only (1280x720)
- Error states (API failure, network timeout)
- Test with both mock and real API endpoints

### 4. Visual Regression Tests
- Command bar in all states (closed, open, searching, results)
- Answer card with 1-5 citations
- Audio player states (default, loading, playing, paused)
- Dark mode consistency

## Test Environment

### Browser Requirements
- **Chrome**: Latest stable version (v120+)
- **Viewport**: 1280x720 (desktop only)
- **OS**: Testing on macOS for development

### Deferred Testing (Post-Launch)
- ❌ Firefox compatibility
- ❌ Safari compatibility
- ❌ Edge compatibility
- ❌ Mobile browsers (iOS/Android)
- ❌ Responsive design below 1280px
- ❌ Touch interactions
- ❌ Screen reader testing

## Sample Test Cases

### E2E Test - Chrome Desktop
```javascript
// cypress/e2e/command-bar-chrome.cy.js
describe('Command Bar - Chrome Desktop', () => {
  beforeEach(() => {
    cy.viewport(1280, 720); // Fixed desktop viewport
    cy.visit('/test-command-bar');
  });

  it('provides answers to VC questions', () => {
    // Open command bar with slash key
    cy.get('body').type('/');
    cy.get('[data-testid="command-bar"]').should('be.visible');

    // Type question and submit
    cy.get('input[placeholder*="Ask anything"]')
      .type('What are VCs saying about AI valuations?{enter}');

    // Verify answer appears
    cy.get('[data-testid="answer-text"]', { timeout: 5000 })
      .should('contain', 'valuation')
      .and('contain', '¹');

    // Verify citations
    cy.get('[data-testid="citation"]').should('have.length.at.least', 2);

    // Test audio playback
    cy.get('[data-testid="audio-player"]').first().click();
    
    // Wait for audio to load (first play may take 2-3s)
    cy.wait(3000);
    
    // Verify audio is playing
    cy.get('[data-testid="audio-player"]').first()
      .should('have.attr', 'data-playing', 'true');
  });

  it('handles API errors gracefully', () => {
    // Intercept and force error
    cy.intercept('POST', '/api/search', { 
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    });

    cy.get('body').type('/');
    cy.get('input[placeholder*="Ask anything"]')
      .type('test query{enter}');

    // Should show user-friendly error
    cy.get('[data-testid="error-message"]')
      .should('contain', 'Try another question');
  });
});
```

### Component Test - Audio Player
```typescript
// components/__tests__/audio-player.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MiniAudioPlayer } from '../MiniAudioPlayer';

describe('MiniAudioPlayer - Chrome', () => {
  beforeEach(() => {
    // Mock HTMLAudioElement for Chrome
    window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  it('handles on-demand audio generation', async () => {
    const mockOnPlayClick = jest.fn();
    
    render(
      <MiniAudioPlayer 
        src={null}
        onPlayClick={mockOnPlayClick}
        playing={false}
      />
    );

    // Click play button
    fireEvent.click(screen.getByTestId('play-button'));
    
    // Should trigger on-demand generation
    expect(mockOnPlayClick).toHaveBeenCalled();
    
    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('prevents concurrent playback', async () => {
    // Test that only one audio can play at a time
    // Implementation details...
  });
});
```

## Test Data & Fixtures

### Mock Search Responses
```json
{
  "ai_agents": {
    "answer": "VCs express concern that AI agent valuations are outpacing fundamentals¹². Recent rounds show 50-100x revenue multiples².",
    "citations": [
      {
        "index": 1,
        "episode_id": "ep_123",
        "episode_title": "AI Bubble Discussion",
        "podcast_name": "All-In",
        "timestamp": "27:04",
        "start_seconds": 1624
      }
    ]
  }
}
```

## Performance Benchmarks (Chrome)

| Metric | Target | Acceptable |
|--------|---------|------------|
| Command bar open | < 100ms | < 200ms |
| Search response | < 2s | < 3s |
| Audio first play | < 3s | < 4s |
| Audio cached play | < 500ms | < 1s |

## Pre-Launch Testing Checklist

### Chrome Desktop Testing
- [ ] Keyboard shortcuts work (/, ⌘K, ESC)
- [ ] Search returns results in < 3s
- [ ] Answer synthesis displays correctly
- [ ] Citations are clickable and formatted
- [ ] Audio plays on first click (may take 2-3s)
- [ ] Audio controls work (play/pause)
- [ ] Background blur effect applies
- [ ] Scroll hide/show behavior works
- [ ] Error states display user-friendly messages
- [ ] Mock data toggle works for testing

### Known Limitations (Accepted for MVP)
- No mobile support
- No touch interactions
- Chrome-only implementation
- Desktop viewport only (1280x720)
- No accessibility testing
- No responsive design below 1280px

## Documentation Updates

### Required Documentation
1. **Test Results**: `docs/sprint3/chrome_test_results.md`
   - Chrome-specific test outcomes
   - Performance metrics
   - Known issues

2. **Browser Support**: `docs/sprint3/browser_support.md`
   - Chrome MVP focus rationale
   - Future browser roadmap
   - Technical limitations

3. **Testing Guide**: `docs/sprint3/testing_guide.md`
   - How to run Chrome-only tests
   - Mock data setup
   - Performance testing steps