/**
 * Flujo 5: Sincronización en tiempo real entre dos "dispositivos" (contextos).
 *
 * Simula dos usuarios abriendo la app en paralelo con el mismo household_id.
 * Verifica que cuando el Usuario A agrega un producto, el Usuario B lo ve
 * automáticamente sin recargar la página (vía Supabase Realtime).
 *
 * Requisito: Los dos perfiles deben pertenecer al mismo household.
 * Este test requiere un backend de Supabase real (no mock).
 */

import { test as base, expect, Browser, Page } from '@playwright/test';

const REALTIME_PRODUCT = `Realtime E2E ${Date.now()}`;

/**
 * Helper: Abre una nueva página, pasa la selección de perfil eligiendo
 * el perfil en la posición `profileIndex`.
 */
async function openAppAsProfile(
  browser: Browser,
  profileIndex: number
): Promise<{ page: Page; cleanup: () => Promise<void> }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000');

  await page.waitForSelector('[data-testid="profile-selector"]', {
    timeout: 15_000,
  });

  const profileBtns = page.getByTestId('profile-btn');
  const count = await profileBtns.count();
  // Si no hay suficientes perfiles, usar el primero disponible
  const idx = Math.min(profileIndex, count - 1);
  await profileBtns.nth(idx).click();

  await page.waitForSelector('[data-testid="shopping-list"]', {
    timeout: 10_000,
  });

  return {
    page,
    cleanup: () => context.close(),
  };
}

base.describe('Realtime sync — dos dispositivos', () => {
  base(
    'Flujo 5: un cambio de Usuario A aparece en Usuario B sin recargar',
    async ({ browser }) => {
      // Abrir dos "dispositivos" en paralelo
      const [deviceA, deviceB] = await Promise.all([
        openAppAsProfile(browser, 0),
        openAppAsProfile(browser, 1),
      ]);

      try {
        // Usuario A agrega un producto
        const inputA = deviceA.page.getByTestId('smart-input');
        await inputA.fill(REALTIME_PRODUCT);
        await inputA.press('Enter');

        // Verificar que aparece en el dispositivo A
        await expect(
          deviceA.page
            .getByTestId('pending-list')
            .getByText(REALTIME_PRODUCT, { exact: true })
        ).toBeVisible({ timeout: 8_000 });

        // El mismo producto debe aparecer en el dispositivo B
        // sin ninguna acción del usuario B (Realtime push)
        await expect(
          deviceB.page
            .getByTestId('pending-list')
            .getByText(REALTIME_PRODUCT, { exact: true })
        ).toBeVisible({
          timeout: 15_000, // Supabase Realtime puede tener latencia
        });
      } finally {
        await deviceA.cleanup();
        await deviceB.cleanup();
      }
    }
  );
});
