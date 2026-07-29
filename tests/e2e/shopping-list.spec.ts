/**
 * Flujo 1: Agregar un producto nuevo y verificar que aparece en la lista.
 * Flujo 2: Marcar un producto como comprado.
 */

import { test, expect } from './fixtures';

const UNIQUE_PRODUCT = `Manzanas E2E ${Date.now()}`;

test.describe('Shopping list — add & complete', () => {
  test('Flujo 1: agrega un producto y aparece en la lista pendiente', async ({
    authedPage: page,
  }) => {
    // Escribir en el input rápido
    const input = page.getByTestId('smart-input');
    await input.fill(UNIQUE_PRODUCT);
    await input.press('Enter');

    // El producto debe aparecer en la lista de pendientes
    const item = page
      .getByTestId('pending-list')
      .getByText(UNIQUE_PRODUCT, { exact: true });
    await expect(item).toBeVisible({ timeout: 8_000 });
  });

  test('Flujo 2: marca un producto como comprado y pasa a la sección de comprados', async ({
    authedPage: page,
  }) => {
    // Agregar el producto primero (puede ya existir del test anterior si se comparte estado)
    const input = page.getByTestId('smart-input');
    await input.fill(UNIQUE_PRODUCT);
    await input.press('Enter');

    // Esperar que aparezca en pendientes
    const pendingItem = page
      .getByTestId('pending-list')
      .getByText(UNIQUE_PRODUCT, { exact: true });
    await expect(pendingItem).toBeVisible({ timeout: 8_000 });

    // Hacer click en el checkbox (círculo vacío a la izquierda del ítem)
    const checkbox = page
      .getByTestId('pending-list')
      .locator(`[data-testid="item-checkbox"]`)
      .first();
    await checkbox.click();

    // El producto debe aparecer en la lista de comprados
    const completedItem = page
      .getByTestId('completed-list')
      .getByText(UNIQUE_PRODUCT, { exact: true });
    await expect(completedItem).toBeVisible({ timeout: 8_000 });

    // Ya no debe estar en pendientes
    await expect(
      page.getByTestId('pending-list').getByText(UNIQUE_PRODUCT, { exact: true })
    ).not.toBeVisible();
  });
});
