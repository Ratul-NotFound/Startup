---
name: backend-architecture-logic
description: >-
  Advanced architecture patterns for real-time Firebase/Firestore database management, 
  idempotent mutations, transactional atomicity, TTL caching, and secure authorization.
---

# ⚙️ Backend Architecture & Logical System Design

This skill covers best practices for building robust, scalable, real-time backend architectures with zero data corruption and optimal read/write efficiency.

---

## 1. ⚡ Real-Time vs. Cached Data Strategy
Not all data requires continuous WebSocket connections:
* **REAL-TIME (`onSnapshot`)**: Products (price/stock), Coupons, Payment Gateways, and Hero Slides.
  * *Why:* When admins update prices or promo codes, customers must see the change within 100ms.
* **CACHED (`getDoc`/`getDocs` + TTL Cache)**: Static Settings, Categories, FAQs, and System Meta.
  * *Why:* Reduces unnecessary Firestore read billing by 90% and eliminates WebSocket overhead.

---

## 2. 🔒 Transactional Integrity & Atomic Updates
Never perform non-atomic read-modify-write cycles for inventory or financial balance:
```typescript
import { runTransaction, doc } from 'firebase/firestore';

// Atomic Stock Decrement Example
await runTransaction(db, async (transaction) => {
  const prodRef = doc(db, 'products', productId);
  const prodDoc = await transaction.get(prodRef);

  if (!prodDoc.exists()) throw new Error('Product not found');
  const currentStock = prodDoc.data().stockCount ?? 0;

  if (currentStock <= 0) throw new Error('Out of stock');

  transaction.update(prodRef, {
    stockCount: currentStock - 1,
    updatedAt: new Date().toISOString(),
  });
});
```

---

## 3. 💾 Client-Side Frame 0 Hydration (Zero Content Swap)
Always hydrate local browser cache (`localStorage`) on frame 0 to prevent visual flickering before database snapshot arrives:
```typescript
export const readCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data as T;
  } catch {
    return null;
  }
};
```

---

## 4. 🛡️ Role-Based Security & Idempotency
* **Superadmin Protection**: Guard system-critical collections (`admins`, `settings`) by matching authenticated `uid` or verified email against a protected role list.
* **Idempotent Webhooks & Order Fulfillment**: Track `transactionId` unique constraints to prevent double-spending or duplicate credential deliveries.
