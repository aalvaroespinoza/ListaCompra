/**
 * Flujo 4: Ver la lista mientras se está offline.
 *
 * Verifica que:
 * - La app muestra los ítems existentes cuando se pierde la conexión.
 * - Al agregar un ítem offline, aparece en la lista (optimistic update).
 * - El indicador visual de "Sin conexión" es visible.
 * - Al volver a estar online, el indicador desaparece.
 */

import { test, expect, goOffline, goOnline } from './fixtures';

const OFFLINE_PRODUCT = `Producto Offline ${Date.now()}`;

test.describe('Offline — modo sin conexión', () => {
  test('Flujo 4: puede usar la app offline y agrega un producto pendiente de sync', async ({
    authedPage: page,
    context,
  }) => {
    // Primero cargar la lista estando online para poblar la caché de React Query
    await page.waitForSelector('[data-testid="shopping-list"]');

    // Ir offline
    await goOffline(context);

    // El indicador de "Sin conexión" debe aparecer
    await expect(page.getByTestId('offline-indicator')).toBeVisible({
      timeout: 5_000,
    });

    // El texto debe indicar "Sin conexión"
    await expect(page.getByTestId('offline-indicator')).toContainText(
      'Sin conexión'
    );

    // Agregar un ítem mientras se está offline
    const input = page.getByTestId('smart-input');
    await input.fill(OFFLINE_PRODUCT);
    await input.press('Enter');

    // El ítem debe aparecer en la lista (gracias al optimistic update)
    const offlineItem = page
      .getByTestId('pending-list')
      .getByText(OFFLINE_PRODUCT, { exact: true });
    await expect(offlineItem).toBeVisible({ timeout: 5_000 });

    // El toast de confirmación debe mencionar "(Offline)"
    await expect(page.locator('[data-sonner-toast]')).toContainText('Offline', {
      timeout: 5_000,
    });

    // Volver a estar online
    await goOnline(context);

    // El indicador de offline debe desaparecer (puede aparecer el de "Sincronizando")
    await expect(page.getByTestId('offline-indicator')).not.toBeVisible({
      timeout: 10_000,
    });
  });
});
