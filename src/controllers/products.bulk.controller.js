// src/controllers/products.bulk.controller.js
import XLSX from 'xlsx';
import { getConnection } from '../database/connection.js';
import { uploadImage } from '../helpers/uploadImage.js';
import { queries } from '../database/queries.interface.js';

/**
 * Helpers para normalizar encabezados (quitar acentos, espacios -> _ , lower case)
 */
function normalizeHeader(h) {
  if (h === undefined || h === null) return '';
  return String(h)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s\-]+/g, '_')
    .replace(/[^\w_]/g, '');
}

/**
 * Candidate generators para campos de variación / presentación
 */
function variationQualityHeaderName(n) {
  return [`var${n}_calidad`, `v${n}_calidad`, `var${n}_quality`, `v${n}_quality`];
}
function variationActiveHeaderName(n) {
  return [`var${n}_activo`, `v${n}_activo`, `var${n}_active`, `v${n}_active`];
}
function presentationNameCandidates(varIndex, presIndex) {
  const cand = [
    `var${varIndex}_p${presIndex}_presentacion`,
    `v${varIndex}_p${presIndex}_presentacion`,
    `var${varIndex}_pres${presIndex}_presentacion`,
    `v${varIndex}_pres${presIndex}_presentacion`,
    `var${varIndex}_p${presIndex}`,
    `v${varIndex}_p${presIndex}`,
    `var${varIndex}_pres${presIndex}`,
    `v${varIndex}_pres${presIndex}`
  ];
  return cand.map(normalizeHeader);
}
function priceHeaderCandidates(varIndex, presIndex, priceType) {
  // priceType: 'precio_hogar' | 'precio_supermercado' | 'precio_restaurante' | 'precio_fruver'
  const cand = [
    `var${varIndex}_p${presIndex}_${priceType}`,
    `v${varIndex}_p${presIndex}_${priceType}`,
    `var${varIndex}_pres${presIndex}_${priceType}`,
    `v${varIndex}_pres${presIndex}_${priceType}`
  ];
  return cand.map(normalizeHeader);
}

/**
 * Parsea buffer Excel -> array de productos (estructura que espera el resto del controlador)
 * - UNA hoja
 * - Columnas en español (nombre, descripcion, categoria, promocionar, activo)
 * - Variaciones en columnas como var{n}_calidad, var{n}_p{m}_presentacion, var{n}_p{m}_precio_hogar, ...
 * - No usa stock
 */
function parseExcelBufferToProducts(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rows || rows.length < 2) return [];

  const rawHeaders = rows[0].map(h => (h === null || h === undefined ? '' : String(h)));
  const headers = rawHeaders.map(normalizeHeader);

  const findHeaderIndex = (names) => {
    if (!Array.isArray(names)) names = [names];
    for (const n of names) {
      const idx = headers.indexOf(normalizeHeader(n));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  // detectar cuántas variaciones/presentaciones soportar: escanea headers para var1,var2,...
  const maxVarDetected = headers.reduce((acc, h) => {
    const m = h.match(/^v?ar?(\d+)_/);
    if (m) {
      const n = parseInt(m[1], 10);
      return Math.max(acc, n);
    }
    return acc;
  }, 0) || 3; // default 3
  const MAX_VARIATIONS = Math.max(1, Math.min(maxVarDetected, 10)); // cap a 10 para seguridad

  // detectar cuántas presentaciones por variación (escaneo simple)
  const maxPresDetected = headers.reduce((acc, h) => {
    const m = h.match(/_p(\d+)_/);
    if (m) {
      const n = parseInt(m[1], 10);
      return Math.max(acc, n);
    }
    return acc;
  }, 0) || 3;
  const MAX_PRESENTATIONS = Math.max(1, Math.min(maxPresDetected, 10));

  const products = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const hasContent = row.some(c => c !== '' && c !== null && c !== undefined);
    if (!hasContent) continue;

    const getByHeader = (names) => {
      if (!Array.isArray(names)) names = [names];
      for (const n of names) {
        const idx = headers.indexOf(normalizeHeader(n));
        if (idx !== -1) return row[idx];
      }
      return '';
    };

    const name = String(getByHeader(['nombre', 'name']) || '').trim();
    const description = String(getByHeader(['descripcion', 'description']) || '').trim();
    const category = String(getByHeader(['categoria', 'category']) || '').trim();
    const promocionarRaw = getByHeader(['promocionar', 'promote']) || '';
    const activeRaw = getByHeader(['activo', 'active']) || '';

    const promocionar = String(promocionarRaw).toLowerCase() === 'true' || Number(promocionarRaw) === 1;
    const active = activeRaw === '' ? true : (String(activeRaw).toLowerCase() === 'true' || Number(activeRaw) === 1);

    const variations = [];

    for (let vi = 1; vi <= MAX_VARIATIONS; vi++) {
      // calidad
      const qualityIdx = variationQualityHeaderName(vi)
        .map(normalizeHeader)
        .reduce((acc, h) => acc === -1 ? headers.indexOf(h) : acc, -1);
      const quality = qualityIdx !== -1 ? row[qualityIdx] : '';

      // active var optional
      const varActiveIdx = variationActiveHeaderName(vi)
        .map(normalizeHeader)
        .reduce((acc, h) => acc === -1 ? headers.indexOf(h) : acc, -1);
      const varActiveRaw = varActiveIdx !== -1 ? row[varActiveIdx] : true;
      const varActive = varActiveRaw === '' ? true : (String(varActiveRaw).toLowerCase() === 'true' || Number(varActiveRaw) === 1);

      const presentations = [];

      for (let pi = 1; pi <= MAX_PRESENTATIONS; pi++) {
        // localizar nombre de presentación
        const presNameCands = presentationNameCandidates(vi, pi);
        let presNameIdx = -1;
        for (const cand of presNameCands) {
          const idx = headers.indexOf(cand);
          if (idx !== -1) { presNameIdx = idx; break; }
        }
        if (presNameIdx === -1) continue;
        const presName = row[presNameIdx];
        if (!presName || String(presName).trim() === '') continue;

        // precios
        const getPrice = (typeAlias) => {
          const cands = priceHeaderCandidates(vi, pi, typeAlias);
          for (const cand of cands) {
            const idx = headers.indexOf(cand);
            if (idx !== -1) {
              const v = row[idx];
              if (v === '' || v === null || v === undefined) return null;
              const n = parseFloat(String(v).toString().replace(',', '.'));
              return isNaN(n) ? null : n;
            }
          }
          return null;
        };

        const pres = {
          presentation: String(presName).trim(),
          price_home: getPrice('precio_hogar') ?? getPrice('preciohogar') ?? getPrice('precio_hogar'),
          price_supermarket: getPrice('precio_supermercado') ?? getPrice('preciosupermercado'),
          price_restaurant: getPrice('precio_restaurante') ?? getPrice('preciorestaurante'),
          price_fruver: getPrice('precio_fruver') ?? getPrice('preciofruver')
        };

        presentations.push(pres);
      }

      if ((quality && String(quality).trim() !== '') || presentations.length > 0) {
        variations.push({
          quality: String(quality || '').trim(),
          active: varActive,
          presentations
        });
      }
    }

    products.push({
      product_id: null,
      name,
      description,
      category,
      promocionar,
      active,
      variations
    });
  }

  return products;
}

/* ============================
   MAIN CONTROLLERS
   ============================ */

export const createProductsBulk = async (req, res) => {
  let client;
  const startTime = Date.now();

  try {
    // 1) Obtener products desde file (form-data key 'file') o desde req.body.products (JSON)
    let products = [];
    let validateOnly = false;

    if (req.file && req.file.buffer) {
      // parsear excel
      products = parseExcelBufferToProducts(req.file.buffer);
    } else if (req.body && req.body.products) {
      products = Array.isArray(req.body.products) ? req.body.products : JSON.parse(req.body.products || '[]');
    } else {
      return res.status(400).json({ message: 'Se requiere un array de productos o un archivo Excel (campo file)', success: false });
    }

    // detect validateOnly flag
    validateOnly = req.body?.validateOnly === true || req.body?.validateOnly === 'true';

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de productos válido', success: false });
    }

    if (products.length > 1000) {
      return res.status(400).json({ message: 'Máximo 1000 productos por lote', success: false });
    }

    client = await getConnection();

    // sanity checks for queries
    if (!queries || !queries.products || !queries.products.createProduct || !queries.products.createProductVariation || !queries.products.createProductPresentation) {
      throw new Error('Faltan queries esperadas en queries.products (createProduct, createProductVariation, createProductPresentation)');
    }

    // VALIDACION
    const validationResult = await validateBulkProducts(client, products);

    if (!validationResult.isValid) {
      return res.status(400).json({
        message: 'Errores de validación encontrados',
        success: false,
        errors: validationResult.errors,
        validProducts: validationResult.validCount,
        totalProducts: products.length
      });
    }

    if (validateOnly) {
      return res.status(200).json({
        message: 'Validación completada exitosamente',
        success: true,
        validProducts: validationResult.validCount,
        totalProducts: products.length,
        validationTime: Date.now() - startTime
      });
    }

    // CREACION masiva (transacción + batches)
    await client.query('BEGIN');
    const results = { created: [], failed: [], totalProcessed: 0, startTime: new Date().toISOString() };
    const BATCH_SIZE = 50;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchResult = await processBatch(client, batch, i);
      results.created.push(...batchResult.created);
      results.failed.push(...batchResult.failed);
      results.totalProcessed += batch.length;
    }

    await client.query('COMMIT');

    const processingTime = Date.now() - startTime;
    return res.status(201).json({
      message: 'Procesamiento masivo completado',
      success: true,
      summary: {
        totalProducts: products.length,
        created: results.created.length,
        failed: results.failed.length,
        processingTime: `${processingTime}ms`,
        averageTimePerProduct: `${(processingTime / products.length).toFixed(2)}ms`
      },
      results: {
        created: results.created,
        failed: results.failed
      },
      performance: {
        batchSize: BATCH_SIZE,
        totalBatches: Math.ceil(products.length / BATCH_SIZE),
        startTime: results.startTime,
        endTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('createProductsBulk ERROR:', error);
    if (client) {
      try { await client.query('ROLLBACK'); } catch (e) { console.error('rollback error', e); }
    }
    const payload = { message: 'Error en la creación masiva de productos', success: false, error: error.message };
    if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
    return res.status(500).json(payload);
  } finally {
    if (client) client.release();
  }
};

export const validateProductsBulk = async (req, res) => {
  try {
    // marcar para validación
    req.body = req.body || {};
    req.body.validateOnly = true;
    return await createProductsBulk(req, res);
  } catch (error) {
    console.error('validateProductsBulk ERROR:', error);
    return res.status(500).json({ message: 'Error en la validación de productos', success: false, error: error.message });
  }
};

/* -------------------------
   VALIDATION & BATCH PROCESSING
   ------------------------- */

async function validateBulkProducts(client, products) {
  const errors = [];
  let validCount = 0;

  // obtener categorías existentes y nombres para validar duplicados
  const catRes = await client.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
  const existingCategories = new Set(catRes.rows.map(r => String(r.category).toLowerCase()));

  const existingNamesRes = await client.query('SELECT name FROM products');
  const existingProductNames = new Set(existingNamesRes.rows.map(r => String(r.name).toLowerCase()));

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pErrors = [];

    if (!p.name || typeof p.name !== 'string' || p.name.trim().length < 2) {
      pErrors.push('Nombre requerido (mínimo 2 caracteres)');
    } else if (existingProductNames.has(p.name.toLowerCase())) {
      pErrors.push('Producto con este nombre ya existe');
    }

    if (!p.description || typeof p.description !== 'string' || p.description.trim().length < 10) {
      pErrors.push('Descripción requerida (mínimo 10 caracteres)');
    }

    if (!p.category || typeof p.category !== 'string' || p.category.trim() === '') {
      pErrors.push('Categoría requerida');
    }

    if (!p.variations || !Array.isArray(p.variations) || p.variations.length === 0) {
      pErrors.push('Al menos una variación es requerida');
    } else {
      p.variations.forEach((v, vi) => {
        if (!v.quality || typeof v.quality !== 'string' || v.quality.trim() === '') {
          pErrors.push(`Variación ${vi + 1}: Calidad requerida`);
        }
        if (!v.presentations || !Array.isArray(v.presentations) || v.presentations.length === 0) {
          pErrors.push(`Variación ${vi + 1}: Al menos una presentación requerida`);
        } else {
          v.presentations.forEach((pres, pi) => {
            if (!pres.presentation || typeof pres.presentation !== 'string' || pres.presentation.trim() === '') {
              pErrors.push(`Variación ${vi + 1}, Presentación ${pi + 1}: Nombre de presentación requerido`);
            }
            const priceFields = ['price_home', 'price_supermarket', 'price_restaurant', 'price_fruver'];
            priceFields.forEach(field => {
              if (pres[field] !== null && pres[field] !== undefined && pres[field] !== '') {
                const num = parseFloat(pres[field]);
                if (isNaN(num) || num < 0) {
                  pErrors.push(`Variación ${vi + 1}, Presentación ${pi + 1}: ${field} debe ser un número >= 0`);
                }
              }
            });
            // stock no validado ni requerido
          });
        }
      });
    }

    if (pErrors.length) errors.push({ productIndex: i + 1, productName: p.name || 'Sin nombre', errors: pErrors });
    else validCount++;
  }

  return { isValid: errors.length === 0, errors, validCount, totalCount: products.length };
}

async function processBatch(client, batch, startIndex) {
  const created = [];
  const failed = [];

  for (let i = 0; i < batch.length; i++) {
    try {
      const product = batch[i];
      const globalIndex = startIndex + i + 1;

      const productActive = typeof product.active !== 'undefined' ? product.active : true;
      const productPromocionar = typeof product.promocionar === 'boolean' ? product.promocionar : false;
      const defaultPhotoUrl = product.photo_url || 'https://example.com/default-image.jpg';

      // Insert product (queries.products.createProduct must RETURNING product_id)
      const productResult = await client.query(queries.products.createProduct, [
        product.name.trim(),
        product.description.trim(),
        product.category.trim(),
        defaultPhotoUrl,
        productActive,
        productPromocionar
      ]);
      if (!productResult?.rows?.[0]) throw new Error('createProduct no devolvió product_id');
      const productId = productResult.rows[0].product_id;

      // Variations & presentations
      for (const variation of product.variations) {
        const varStatus = typeof variation.active !== 'undefined' ? variation.active : true;
        const formattedPresentations = (variation.presentations || []).map(p => ({
          presentation: String(p.presentation).trim(),
          price_home: p.price_home !== null && p.price_home !== undefined ? parseFloat(p.price_home) : 0,
          price_supermarket: p.price_supermarket !== null && p.price_supermarket !== undefined ? parseFloat(p.price_supermarket) : 0,
          price_restaurant: p.price_restaurant !== null && p.price_restaurant !== undefined ? parseFloat(p.price_restaurant) : 0,
          price_fruver: p.price_fruver !== null && p.price_fruver !== undefined ? parseFloat(p.price_fruver) : 0
        }));

        // create variation (must RETURNING variation_id)
        const variationResult = await client.query(queries.products.createProductVariation, [
          productId,
          variation.quality.trim(),
          JSON.stringify(formattedPresentations),
          varStatus
        ]);
        if (!variationResult?.rows?.[0]) throw new Error('createProductVariation no devolvió variation_id');
        const variationId = variationResult.rows[0].variation_id;

        // create presentations (if DB stores separately)
        for (const pres of formattedPresentations) {
          await client.query(queries.products.createProductPresentation, [
            variationId,
            pres.presentation,
            pres.price_home,
            pres.price_supermarket,
            pres.price_restaurant,
            pres.price_fruver,
            0 // stock omitido, poner 0 por compatibilidad con la query
          ]);
        }
      }

      created.push({
        index: globalIndex,
        productId,
        name: product.name,
        variationsCount: product.variations.length,
        presentationsCount: product.variations.reduce((sum, v) => sum + (v.presentations?.length || 0), 0)
      });

    } catch (err) {
      console.error('processBatch item error:', err);
      failed.push({ index: startIndex + i + 1, name: batch[i]?.name || 'Sin nombre', error: err.message || String(err) });
    }
  }

  return { created, failed };
}
