import { test, expect } from '@playwright/test'

async function login(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar sesión' }).last().click()
  await page.getByLabel('Correo electrónico').fill('maria@nexo.local')
  await page.getByLabel('Contraseña', { exact: true }).fill('Nexo2026!')
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click()
  await expect(page.getByRole('heading', { name: 'Buen día, María.' })).toBeVisible()
}
test('el resumen muestra el espacio y los proyectos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Buen día, equipo.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Órbita', exact: true })).toBeVisible()
})
test('conserva la sesión después de recargar', async ({ page }) => {
  await login(page)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Buen día, María.' })).toBeVisible()
})
test('la búsqueda de contactos acepta mayúsculas', async ({ page }) => {
  await page.goto('/contacts')
  await page.getByRole('textbox', { name: 'Buscar contactos' }).fill('ANA')
  await expect(page.getByText('Ana García', { exact: true })).toBeVisible()
})
test('muestra el perfil de una persona del equipo', async ({ page }) => {
  await page.goto('/team')
  await page.getByRole('link', { name: 'Ver perfil' }).first().click()
  await expect(page.getByRole('heading', { name: 'María Torres' })).toBeVisible()
})
test('filtra la biblioteca por categoría', async ({ page }) => {
  await page.goto('/resources')
  await expect(page.getByText('Interfaces que se sienten bien')).toBeVisible()
  await page.getByRole('button', { name: 'Desarrollo', exact: true }).click()
  await expect(page.getByText('Interfaces que se sienten bien')).not.toBeVisible()
  await expect(page.getByText('Nuestra biblioteca de componentes')).toBeVisible()
})
test('completar una tarea actualiza la pantalla', async ({ page }) => {
  await login(page)
  const response = await page.request.get('/api/tasks')
  const task = (await response.json()).find((task) => task.status === 'doing')
  await page.getByRole('link', { name: 'Tareas', exact: true }).click()
  const card = page
    .locator('.board-card')
    .filter({ has: page.getByRole('heading', { name: task.title, exact: true }) })
  await card.getByRole('button', { name: 'Completar', exact: true }).click()
  await expect(
    page.locator('.board-column.done').getByRole('heading', { name: task.title, exact: true }),
  ).toBeVisible()
})
