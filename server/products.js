import { db } from './db.js'
import { ApiError, bad, clean, parseId } from './util.js'

const toDto = (r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: r.price,
  stock: r.stock,
  category: r.category,
  imageUrl: r.image_url,
  createdAt: r.created_at,
})

export async function listProducts({ q, category } = {}) {
  const needle = String(q || '').trim().toLowerCase()
  const cat = String(category || '').trim()
  const { rows } = await db.query(
    `SELECT * FROM products
      WHERE active = TRUE
        AND ($1 = '' OR lower(category) = lower($1))
        AND ($2 = '' OR position($2 in lower(name)) > 0 OR position($2 in lower(coalesce(description, ''))) > 0)
      ORDER BY created_at DESC, id DESC`,
    [cat, needle],
  )
  return rows.map(toDto)
}

export async function listCategories() {
  const { rows } = await db.query(`SELECT DISTINCT category FROM products WHERE active = TRUE ORDER BY category`)
  return rows.map((r) => r.category)
}

async function findActive(rawId) {
  const id = parseId(rawId, 'Product not found')
  const { rows } = await db.query(`SELECT * FROM products WHERE id = $1 AND active = TRUE`, [id])
  if (!rows[0]) throw new ApiError(404, 'Product not found')
  return rows[0]
}

export async function getProduct(id) {
  return toDto(await findActive(id))
}

function validate(body = {}) {
  const name = clean(body.name)
  const category = clean(body.category)
  const description = clean(body.description)
  const imageUrl = clean(body.imageUrl)
  const price = Number(body.price)
  const stock = Number(body.stock)
  if (!name || name.length > 200) throw bad('Enter a product name (max 200 characters)')
  if (!category || category.length > 100) throw bad('Enter a category (max 100 characters)')
  if (description && description.length > 4000) throw bad('Description is too long (max 4000 characters)')
  if (!(price >= 0.01)) throw bad('Price must be greater than 0')
  if (price >= 1e8 || Math.round(price * 100) / 100 !== price) throw bad('Price can have at most 2 decimal places')
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw bad('Stock must be a whole number from 0 to 100000')
  if (imageUrl && (!/^https:\/\//.test(imageUrl) || imageUrl.length > 500)) throw bad('Image URL must start with https://')
  return { name, category, description, imageUrl, price, stock }
}

export async function createProduct(body) {
  const p = validate(body)
  const { rows } = await db.query(
    `INSERT INTO products (name, description, price, stock, category, image_url)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [p.name, p.description, p.price, p.stock, p.category, p.imageUrl],
  )
  return toDto(rows[0])
}

export async function updateProduct(rawId, body) {
  const p = validate(body)
  const existing = await findActive(rawId)
  const { rows } = await db.query(
    `UPDATE products SET name=$2, description=$3, price=$4, stock=$5, category=$6, image_url=$7, updated_at=now()
      WHERE id=$1 RETURNING *`,
    [existing.id, p.name, p.description, p.price, p.stock, p.category, p.imageUrl],
  )
  return toDto(rows[0])
}

/** Soft delete: the product disappears from the store but past orders keep their snapshot. */
export async function deleteProduct(rawId) {
  const existing = await findActive(rawId)
  await db.query(`UPDATE products SET active = FALSE, updated_at = now() WHERE id = $1`, [existing.id])
}
