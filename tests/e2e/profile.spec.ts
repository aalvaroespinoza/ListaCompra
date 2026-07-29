/**
 * Flujo 3: Cambiar de perfil de usuario.
 *
 * Verifica que:
 * - El avatar del perfil activo es visible en el header.
 * - Al hacer click en el avatar se vuelve a la pantalla de selección.
 * - Al elegir otro perfil, el header muestra el nuevo nombre.
 */

import { test, expect } from './fixtures';

test.describe('Profile — cambiar perfil', () => {
  test('Flujo 3: puede cambiar de perfil desde el header', async ({
    authedPage: page,
  }) => {
    // Leer el nombre del perfil actual en el título del header
    const headerTitle = page.getByTestId('header-title');
    const initialGreeting = await headerTitle.textContent();
    expect(initialGreeting).toBeTruthy();

    // Hacer click en el avatar del header para volver al selector
    await page.getByTestId('profile-avatar-btn').click();

    // Debe aparecer la pantalla de selección de perfil
    await expect(page.getByTestId('profile-selector')).toBeVisible({
      timeout: 5_000,
    });

    // Seleccionar el segundo perfil disponible (o el primero si solo hay uno)
    const profileBtns = page.getByTestId('profile-btn');
    const count = await profileBtns.count();
    const targetIndex = count > 1 ? 1 : 0;
    const targetName = await profileBtns.nth(targetIndex).textContent();
    await profileBtns.nth(targetIndex).click();

    // Volver a la lista
    await page.waitForSelector('[data-testid="shopping-list"]', {
      timeout: 8_000,
    });

    // El header debe reflejar el nuevo perfil (o el mismo si solo hay uno)
    const newGreeting = await page.getByTestId('header-title').textContent();
    if (count > 1) {
      expect(newGreeting).not.toEqual(initialGreeting);
    } else {
      // Solo un perfil: el saludo debe ser el mismo
      expect(newGreeting).toEqual(initialGreeting);
    }

    // El nombre del perfil debe aparecer en el saludo
    if (targetName) {
      const firstName = targetName.trim().split(' ')[0];
      expect(newGreeting).toContain(firstName);
    }
  });
});
