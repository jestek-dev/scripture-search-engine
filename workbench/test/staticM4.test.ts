import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');

describe('Milestone 4 static workbench controls', () => {
  it('exposes only the fixed review operations and check ids', () => {
    expect(page).toContain("{ id: 'changes', label: 'Changes' }");
    expect(page).toContain("'/api/v2/compile/preview'");
    expect(page).toContain("'/api/v2/compile/apply'");
    expect(page).toContain('/api/v2/fixtures/${encodeURIComponent(fixtureId)}/promotion/preview');
    expect(page).toContain("['typecheck', 'Typecheck']");
    expect(page).toContain("['verify', 'Full verify']");
    expect(page).not.toMatch(/\b(command|cwd|argv|args)\s*:/);
  });

  it('keeps destructive apply behind a digest confirmation and safe DOM rendering', () => {
    expect(page).toContain("input.value !== plan.digest");
    expect(page).toContain("state.changes.promotionConfirmation !== plan.digest");
    expect(page).toContain("textContent = typeof text === 'string'");
    expect(page).not.toContain('innerHTML');
  });

  it('watches live job status with events and polling, including cancellation', () => {
    expect(page).toContain('/events`');
    expect(page).toContain('window.setInterval');
    expect(page).toContain('/cancel`');
  });
});
