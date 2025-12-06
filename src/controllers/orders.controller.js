import { getConnection } from "../database/connection.js";
import { queries } from "../database/queries.interface.js";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/config.js";
import crypto from "crypto";

// --- UTILIDADES DE NORMALIZACIÓN MEJORADAS ---
// Normalización estricta: mantiene estructura pero normaliza mayúsculas/tildes/espacios
const normalizeStrict = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita tildes
    .trim()
    .replace(/\s+/g, " "); // Unifica espacios múltiples
};

// Normalización fuzzy: elimina TODO excepto letras y números para matching flexible
const normalizeFuzzy = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ""); // Elimina todo excepto letras y números
};

export const placeOrder = async (req, res) => {
  const {
    cartDetails,
    shippingMethod,
    estimatedDelivery,
    actualDelivery,
    total,
    userData,
    companyName,
    companyNit,
    userId: userIdFromRequest,
  } = req.body;

  const userId = req.user?.id || userIdFromRequest;

  if (
    !userId ||
    !Array.isArray(cartDetails) ||
    cartDetails.length === 0 ||
    !total ||
    !userData
  ) {
    return res.status(400).json({ msg: "Información incompleta." });
  }

  const requiredUserDataFields = [
    "user_name",
    "email",
    "phone",
    "city",
    "address",
    "neighborhood",
  ];
  for (const field of requiredUserDataFields) {
    if (!userData[field] || String(userData[field]).trim() === "") {
      return res
        .status(400)
        .json({ msg: `El campo '${field}' es obligatorio.` });
    }
  }

  for (const item of cartDetails) {
    if (
      !item.productId ||
      !item.variationId ||
      item.quantity <= 0 ||
      item.price < 0
    ) {
      return res.status(400).json({ msg: `Producto inválido.` });
    }
  }

  const trackingNumber = crypto.randomBytes(5).toString("hex");
  const shippingStatusId = 1;
  let client;

  try {
    client = await getConnection();
    let userType = "hogar";

    if (userId !== "guest-user") {
      const userResult = await client.query(
        `SELECT id, user_type FROM users WHERE id = $1`,
        [userId]
      );
      if (userResult.rows.length > 0) {
        userType = userResult.rows[0].user_type || "hogar";
      } else {
        return res.status(404).json({ msg: "Usuario no encontrado." });
      }
    }

    const finalUserType = userType === "admin" ? "fruver" : userType;
    const needsElectronicInvoice = finalUserType === "restaurante";

    const productIds = cartDetails.map((item) => item.productId);
    const productCheckResult = await client.query(
      `SELECT product_id FROM products WHERE product_id = ANY($1)`,
      [productIds]
    );
    const existingProductIds = productCheckResult.rows.map(
      (row) => row.product_id
    );
    const invalidProducts = productIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    if (invalidProducts.length > 0) {
      return res
        .status(400)
        .json({ msg: "Productos inexistentes.", invalidProducts });
    }

    const orderResult = await client.query(queries.orders.createOrder, [
      userId === "guest-user" ? null : userId,
      new Date(),
      1,
      total,
      needsElectronicInvoice,
      companyName || null,
      companyNit || null,
      finalUserType,
    ]);
    const orderId = orderResult.rows[0].id;

    await client.query(
      "INSERT INTO user_data (order_id, user_data) VALUES ($1, $2)",
      [orderId, userData]
    );

    const aggregatedCart = cartDetails.reduce((acc, item) => {
      const key = `${item.variationId}-${item.presentation}`;
      if (acc[key]) {
        acc[key].quantity += item.quantity;
      } else {
        acc[key] = { ...item };
      }
      return acc;
    }, {});

    for (const item of Object.values(aggregatedCart)) {
      await client.query(queries.orders.createOrderItem, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
        item.variationId,
        item.quality,
        item.presentation,
        item.presentation_id,
      ]);
    }

    if (shippingMethod) {
      await client.query(queries.shipping_info.createShippingInfo, [
        shippingMethod,
        trackingNumber,
        estimatedDelivery,
        actualDelivery,
        shippingStatusId,
        orderId,
      ]);
    }

    let accessToken = null;
    if (userId === "guest-user") {
      accessToken = jwt.sign(
        { orderId: orderId, guest: true },
        authConfig.secret,
        { expiresIn: "1h" }
      );
    }

    res.status(201).json({ msg: "Pedido realizado.", orderId, accessToken });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error interno." });
  } finally {
    if (client) client.release();
  }
};

export const getOrders = async (req, res) => {
  let client;
  try {
    client = await getConnection();
    const ordersResult = await client.query(queries.orders.getOrders);
    const orders = ordersResult.rows;
    const orderIds = orders.map((order) => order.id);

    const itemsResult = await client.query(
      queries.orders.getOrderItemsByOrderIds,
      [orderIds]
    );
    const orderItems = itemsResult.rows;

    const shippingResult = await client.query(
      queries.orders.getShippingInfoByOrderIds,
      [orderIds]
    );
    const shippingInfo = shippingResult.rows;

    const userDataResult = await client.query(
      `SELECT order_id, user_data FROM user_data WHERE order_id = ANY($1)`,
      [orderIds]
    );
    const userDataMap = userDataResult.rows.reduce(
      (acc, row) => ({ ...acc, [row.order_id]: row.user_data }),
      {}
    );

    const ordersWithDetails = orders.map((order) => {
      const itemsForOrder = orderItems.filter(
        (item) => item.order_id === order.id
      );

      const aggregatedItems = itemsForOrder.reduce((acc, item) => {
        const key = `${item.variation_id}-${item.presentation}`;
        if (acc[key]) {
          acc[key].quantity += item.quantity;
        } else {
          acc[key] = { ...item };
        }
        return acc;
      }, {});

      return {
        order: { ...order, total: Math.round(Number(order.total) || 0) },
        userData: userDataMap[order.id] || null,
        items: Object.values(aggregatedItems),
        shippingInfo:
          shippingInfo.find((info) => info.order_id === order.id) || null,
      };
    });

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error al obtener pedidos." });
  } finally {
    if (client) client.release();
  }
};

export const getOrdersById = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params;
    const isGuest = !!req.guestOrder;
    const authenticatedUserId = !isGuest ? req.user.id : null;
    const userRole = !isGuest ? req.user.role : null;

    client = await getConnection();
    const orderResult = await client.query(queries.orders.getOrdersById, [
      orderId,
    ]);

    if (orderResult.rows.length === 0)
      return res.status(404).json({ msg: "No encontrado." });
    const order = orderResult.rows[0];

    if (
      !isGuest &&
      userRole !== "admin" &&
      order.customer_id !== authenticatedUserId
    ) {
      return res.status(403).json({ msg: "Acceso prohibido." });
    }

    const itemsResult = await client.query(
      queries.orders.getOrderItemsByOrderId,
      [orderId]
    );
    const shippingResult = await client.query(
      queries.orders.getShippingInfoByOrderId,
      [orderId]
    );
    const userDataResult = await client.query(
      `SELECT user_data FROM user_data WHERE order_id = $1`,
      [orderId]
    );

    res.status(200).json({
      order: { ...order, total: order.total },
      userData: userDataResult.rows[0]?.user_data || null,
      items: itemsResult.rows,
      shippingInfo: shippingResult.rows[0] || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error interno." });
  } finally {
    if (client) client.release();
  }
};

export const createOrders = async (req, res) => {
  /* ... */
};
export const updateOrders = async (req, res) => {
  /* ... */
};
export const updateOrderStatus = async (req, res) => {
  const { id, status_id } = req.params;
  let client;
  try {
    client = await getConnection();
    await client.query(queries.orders.updateOrderStatus, [status_id, id]);
    res.status(200).json({ msg: "Estado actualizado." });
  } catch (e) {
    res.status(500).json({ msg: "Error." });
  } finally {
    if (client) client.release();
  }
};

export const deleteOrders = async (req, res) => {
  let client;
  try {
    const { orderId } = req.params;
    client = await getConnection();
    const id = parseInt(orderId, 10);

    const check = await client.query("SELECT id FROM orders WHERE id = $1", [
      id,
    ]);
    if (check.rowCount === 0)
      return res.status(404).json({ msg: "No encontrado" });

    await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);
    await client.query("DELETE FROM user_data WHERE order_id = $1", [id]);
    await client.query("DELETE FROM shipping_info WHERE order_id = $1", [id]);
    await client.query("DELETE FROM orders WHERE id = $1", [id]);

    res.status(200).json({ msg: "Eliminado." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error." });
  } finally {
    if (client) client.release();
  }
};

export const updateBulkOrders = async (req, res) => {
  const { orderIds, newStatus } = req.body;
  if (!orderIds || !Array.isArray(orderIds))
    return res.status(400).json({ msg: "Faltan IDs" });

  let client;
  try {
    client = await getConnection();
    await client.query("BEGIN");
    const numericIds = orderIds.map(Number);
    const updateResult = await client.query(
      queries.orders.updateBulkOrderStatus,
      [newStatus, numericIds]
    );
    await client.query("COMMIT");
    res
      .status(200)
      .json({ success: true, updatedCount: updateResult.rowCount });
  } catch (e) {
    if (client) await client.query("ROLLBACK");
    res.status(500).json({ msg: "Error." });
  } finally {
    if (client) client.release();
  }
};

export const updateOrderById = async (req, res) => {
  const { orderId } = req.params;
  let {
    status_id,
    requires_electronic_billing,
    company_name,
    nit,
    user_type,
    shipping,
    userData,
    items,
    itemsToRemove,
    shipping_cost,
    shipping_percentage,
  } = req.body;
  if (!orderId) return res.status(400).json({ msg: "orderId es requerido" });

  let client;
  try {
    client = await getConnection();
    await client.query("BEGIN");

    const orderLock = await client.query(
      `SELECT id, customer_id FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );
    if (orderLock.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ msg: "Orden no encontrada." });
    }

    const fieldsToUpdate = [];
    const values = [];
    let idx = 1;

    if (status_id !== undefined) {
      fieldsToUpdate.push(`status_id = $${idx++}`);
      values.push(status_id);
    }
    if (requires_electronic_billing !== undefined) {
      fieldsToUpdate.push(`requires_electronic_billing = $${idx++}`);
      values.push(requires_electronic_billing);
    }
    if (company_name !== undefined) {
      fieldsToUpdate.push(`company_name = $${idx++}`);
      values.push(company_name);
    }
    if (nit !== undefined) {
      fieldsToUpdate.push(`nit = $${idx++}`);
      values.push(nit);
    }
    if (user_type !== undefined) {
      fieldsToUpdate.push(`user_type = $${idx++}`);
      values.push(user_type);
    }

    if (fieldsToUpdate.length > 0) {
      values.push(orderId);
      await client.query(
        `UPDATE orders SET ${fieldsToUpdate.join(", ")} WHERE id = $${idx}`,
        values
      );
    }

    // CORRECCIÓN: Eliminar TODOS los items y luego insertar los nuevos
    // Esto soluciona el problema de duplicación de items
    if (Array.isArray(items) && items.length > 0) {
      const normalizedItems = items.map((it, i) => ({
        productId: it.productId ?? it.product_id,
        variationId: it.variationId ?? it.variation_id,
        presentationId: it.presentationId ?? it.presentation_id,
        price: Math.round(Number(it.price || 0)),
        quantity: Math.round(Number(it.quantity || 0)),
        quality: it.quality,
        presentation: it.presentation,
      }));

      // Primero eliminar TODOS los items de esta orden
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [
        orderId,
      ]);

      // Luego insertar todos los items nuevos
      for (const it of normalizedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, variation_id, presentation_id, presentation, price, quantity, quality) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            orderId,
            it.productId,
            it.variationId,
            it.presentationId || null,
            it.presentation || null,
            it.price,
            it.quantity,
            it.quality || null,
          ]
        );
      }
    }

    if (shipping) {
      const sh = await client.query(
        `SELECT id FROM shipping_info WHERE order_id = $1`,
        [orderId]
      );
      if (sh.rowCount > 0) {
        await client.query(
          `UPDATE shipping_info SET shipping_method = $1, tracking_number = $2, estimated_delivery = $3, actual_delivery = $4, shipping_status_id = $5 WHERE order_id = $6`,
          [
            shipping.shippingMethod,
            shipping.trackingNumber,
            shipping.estimatedDelivery,
            shipping.actualDelivery,
            shipping.shippingStatusId,
            orderId,
          ]
        );
      } else {
        await client.query(
          `INSERT INTO shipping_info (shipping_method, tracking_number, estimated_delivery, actual_delivery, shipping_status_id, order_id) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            shipping.shippingMethod,
            shipping.trackingNumber,
            shipping.estimatedDelivery,
            shipping.actualDelivery,
            shipping.shippingStatusId,
            orderId,
          ]
        );
      }
      if (shipping.shipping_cost !== undefined)
        shipping_cost = Number(shipping.shipping_cost);
    }

    const totalRes = await client.query(
      `SELECT COALESCE(SUM(price * quantity), 0) as sub FROM order_items WHERE order_id = $1`,
      [orderId]
    );
    const sub = Number(totalRes.rows[0].sub);
    const newShipping = shipping_cost ? Number(shipping_cost) : 0;

    await client.query(
      `UPDATE orders SET total = $1, shipping_cost = $2 WHERE id = $3`,
      [sub + newShipping, newShipping, orderId]
    );

    await client.query("COMMIT");
    res.status(200).json({ msg: "Orden actualizada." });
  } catch (e) {
    if (client) await client.query("ROLLBACK");
    console.error("Error updateOrderById:", e);
    res.status(500).json({ msg: "Error" });
  } finally {
    if (client) client.release();
  }
};

// =================================================================================
// MÉTODO DEFINITIVO: JOINS REALES CON TABLA DE PRESENTACIONES
// =================================================================================
export const updateOrderPrices = async (req, res) => {
  let client;
  try {
    client = await getConnection();
    await client.query("BEGIN");

    console.log(
      "--- INICIANDO ACTUALIZACIÓN (QUERY CORREGIDO PARA TABLA 'product_presentations') ---"
    );

    const userTypeToPriceKey = {
      hogar: "price_home",
      supermercado: "price_supermarket",
      restaurante: "price_restaurant",
      fruver: "price_fruver",
    };

    // 1. Obtener órdenes pendientes
    const pendingOrdersResult = await client.query(`
      SELECT
        o.id as order_id,
        o.user_type,
        oi.id as item_id,
        oi.product_id,
        oi.variation_id,
        oi.presentation_id,
        oi.presentation, 
        oi.price as old_price,
        oi.quantity
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status_id = 1;
    `);

    const itemsToUpdate = pendingOrdersResult.rows;

    if (itemsToUpdate.length === 0) {
      await client.query("COMMIT");
      return res.status(200).json({ msg: "No hay ítems pendientes." });
    }

    // 2. Obtener productos CON JOIN A product_presentations
    const uniqueProductIds = [
      ...new Set(itemsToUpdate.map((i) => i.product_id)),
    ];

    const productsResult = await client.query(
      `
      SELECT 
        p.product_id,
        p.name as product_name,
        v.variation_id,
        json_agg(
          json_build_object(
            'presentation', pp.presentation,
            'price_home', pp.price_home,
            'price_supermarket', pp.price_supermarket,
            'price_restaurant', pp.price_restaurant,
            'price_fruver', pp.price_fruver
          ) 
        ) FILTER (WHERE pp.presentation_id IS NOT NULL) as presentations
      FROM products p
      JOIN product_variations v ON p.product_id = v.product_id
      LEFT JOIN product_presentations pp ON v.variation_id = pp.variation_id
      WHERE p.product_id = ANY($1)
      GROUP BY p.product_id, p.name, v.variation_id
    `,
      [uniqueProductIds]
    );

    // 3. Crear Mapas con TRIPLE INDEXACIÓN para matching robusto
    const priceMapStrict = new Map(); // Por nombre normalizado strict
    const priceMapFuzzy = new Map(); // Por nombre normalizado fuzzy
    const priceMapById = new Map(); // Por presentation_id directamente
    const singleVariationFallback = new Map();
    const availablePresentationsByProd = {};

    for (const row of productsResult.rows) {
      if (!availablePresentationsByProd[row.product_id]) {
        availablePresentationsByProd[row.product_id] = [];
      }

      if (row.presentations && Array.isArray(row.presentations)) {
        // Filtrar nulos por si el LEFT JOIN trajo basura
        const validPresentations = row.presentations.filter(
          (p) => p.presentation
        );

        // FALLBACK: Si solo hay 1 presentación, úsala siempre
        if (validPresentations.length === 1) {
          const pres = validPresentations[0];
          const prices = {
            price_home: Math.round(Number(pres.price_home) || 0),
            price_supermarket: Math.round(Number(pres.price_supermarket) || 0),
            price_restaurant: Math.round(Number(pres.price_restaurant) || 0),
            price_fruver: Math.round(Number(pres.price_fruver) || 0),
          };
          singleVariationFallback.set(row.product_id, prices);
        }

        for (const pres of validPresentations) {
          const presNameStrict = normalizeStrict(pres.presentation);
          const presNameFuzzy = normalizeFuzzy(pres.presentation);
          availablePresentationsByProd[row.product_id].push(presNameStrict);

          const prices = {
            price_home: Math.round(Number(pres.price_home) || 0),
            price_supermarket: Math.round(Number(pres.price_supermarket) || 0),
            price_restaurant: Math.round(Number(pres.price_restaurant) || 0),
            price_fruver: Math.round(Number(pres.price_fruver) || 0),
          };

          // Indexar por nombre strict (variación y producto)
          priceMapStrict.set(
            `VAR:${row.variation_id}:${presNameStrict}`,
            prices
          );
          priceMapStrict.set(
            `PROD:${row.product_id}:${presNameStrict}`,
            prices
          );

          // Indexar por nombre fuzzy (variación y producto)
          priceMapFuzzy.set(`VAR:${row.variation_id}:${presNameFuzzy}`, prices);
          priceMapFuzzy.set(`PROD:${row.product_id}:${presNameFuzzy}`, prices);
        }
      }
    }

    // 4. Iterar y comparar con ESTRATEGIA MULTI-NIVEL
    const updatePromises = [];
    let updatesCount = 0;
    const matchStats = { strict: 0, fuzzy: 0, fallback: 0, failed: 0 };

    for (const item of itemsToUpdate) {
      let safeUserType = item.user_type
        ? String(item.user_type).toLowerCase().trim()
        : "hogar";
      if (safeUserType === "guest-user") safeUserType = "hogar";

      const priceKey = userTypeToPriceKey[safeUserType] || "price_home";
      const itemPresNameStrict = normalizeStrict(item.presentation);
      const itemPresNameFuzzy = normalizeFuzzy(item.presentation);

      let newPrices = null;
      let matchMethod = "";

      // NIVEL 1: Match por presentation_id (si existe)
      if (item.presentation_id && priceMapById.has(item.presentation_id)) {
        newPrices = priceMapById.get(item.presentation_id);
        matchMethod = "by_id";
        matchStats.strict++;
      }

      // NIVEL 2: Match STRICT por variación + nombre normalizado
      if (!newPrices) {
        let mapKey = `VAR:${item.variation_id}:${itemPresNameStrict}`;
        newPrices = priceMapStrict.get(mapKey);

        if (!newPrices) {
          mapKey = `PROD:${item.product_id}:${itemPresNameStrict}`;
          newPrices = priceMapStrict.get(mapKey);
        }

        if (newPrices) {
          matchMethod = "strict";
          matchStats.strict++;
        }
      }

      // NIVEL 3: Match FUZZY (elimina TODO excepto letras y números)
      if (!newPrices) {
        let mapKey = `VAR:${item.variation_id}:${itemPresNameFuzzy}`;
        newPrices = priceMapFuzzy.get(mapKey);

        if (!newPrices) {
          mapKey = `PROD:${item.product_id}:${itemPresNameFuzzy}`;
          newPrices = priceMapFuzzy.get(mapKey);
        }

        if (newPrices) {
          matchMethod = "fuzzy";
          matchStats.fuzzy++;
          console.log(
            `⚠️ Match FUZZY para Item ${item.item_id}: "${item.presentation}"`
          );
        }
      }

      // NIVEL 4: FALLBACK si solo hay una presentación disponible
      if (!newPrices) {
        newPrices = singleVariationFallback.get(item.product_id);
        if (newPrices) {
          matchMethod = "fallback";
          matchStats.fallback++;
          console.log(
            `ℹ️ Usando FALLBACK (única presentación) para Prod ${item.product_id}`
          );
        }
      }

      // APLICAR ACTUALIZACIÓN SI SE ENCONTRÓ PRECIO
      if (newPrices) {
        const precioNuevo = newPrices[priceKey];
        const precioViejo = Math.round(Number(item.old_price));

        if (precioNuevo !== undefined && precioNuevo !== precioViejo) {
          console.log(
            `✅ ${matchMethod.toUpperCase()} - Item ${item.item_id}: "${
              item.presentation
            }" => $${precioNuevo} (era $${precioViejo})`
          );
          updatePromises.push(
            client.query(`UPDATE order_items SET price = $1 WHERE id = $2`, [
              precioNuevo,
              item.item_id,
            ])
          );
          updatesCount++;
        }
      } else {
        // NO SE ENCONTRÓ MATCH
        matchStats.failed++;
        const available = availablePresentationsByProd[item.product_id] || [];
        console.error(
          `❌ SIN MATCH: Item ${item.item_id}, Prod ${item.product_id}\n` +
            `   Buscado (strict): "${itemPresNameStrict}"\n` +
            `   Buscado (fuzzy): "${itemPresNameFuzzy}"\n` +
            `   Disponibles en DB: [${available.join(", ")}]`
        );
      }
    }

    console.log("\n📊 ESTADÍSTICAS DE MATCHING:");
    console.log(`   ✓ Match Strict/ID: ${matchStats.strict}`);
    console.log(`   ⚠ Match Fuzzy: ${matchStats.fuzzy}`);
    console.log(`   ℹ Fallback (1 pres): ${matchStats.fallback}`);
    console.log(`   ❌ Sin Match: ${matchStats.failed}\n`);

    // 5. Ejecutar actualizaciones
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`--- ${updatesCount} PRECIOS ACTUALIZADOS ---`);
    }

    // 6. Recálculo de Totales
    const affectedOrderIds = [...new Set(itemsToUpdate.map((i) => i.order_id))];

    const checkCustomerTypesTable = await client.query(`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_types');
    `);

    let shippingCostExpression = "o.shipping_cost";
    let joins = "";

    if (checkCustomerTypesTable.rows[0].exists) {
      joins = `LEFT JOIN customer_types ct ON LOWER(ct.type_name) = LOWER(o.user_type)`;
      shippingCostExpression = "COALESCE(ct.shipping_cost, o.shipping_cost)";
    }

    await client.query(
      `
        WITH subtotals AS (
            SELECT order_id, COALESCE(SUM(price * quantity), 0) AS new_subtotal
            FROM order_items WHERE order_id = ANY($1) GROUP BY order_id
        ),
        shipping_calculation AS (
            SELECT sub.order_id, sub.new_subtotal, ${shippingCostExpression} AS new_shipping_cost
            FROM subtotals sub JOIN orders o ON sub.order_id = o.id ${joins}
        )
        UPDATE orders o
        SET shipping_cost = sc.new_shipping_cost,
            total = sc.new_subtotal + COALESCE(sc.new_shipping_cost, 0)
        FROM shipping_calculation sc
        WHERE o.id = sc.order_id;
    `,
      [affectedOrderIds]
    );

    console.log("✅ Totales recalculados.");

    await client.query("COMMIT");
    res.status(200).json({
      msg: `Proceso finalizado. ${updatesCount} items actualizados.`,
      updatesCount,
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("❌ Error CRÍTICO:", error);
    res.status(500).json({ msg: "Error interno." });
  } finally {
    if (client) client.release();
  }
};
