import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple event emitter for reactivity
const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('Listener error in db:', e);
    }
  });
};

export const subscribeToDb = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Helper to simulate Dexie-like API backed by AsyncStorage
class Collection {
  constructor(name) {
    this.name = name;
  }

  async getAll() {
    try {
      const json = await AsyncStorage.getItem(this.name);
      if (!json) return [];
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(`Error reading ${this.name}:`, e);
      return [];
    }
  }

  async setAll(data) {
    try {
      const safeData = Array.isArray(data) ? data : [];
      await AsyncStorage.setItem(this.name, JSON.stringify(safeData));
      notifyListeners();
    } catch (e) {
      console.error(`Error writing ${this.name}:`, e);
    }
  }

  async toArray() {
    return await this.getAll();
  }

  async count() {
    const items = await this.getAll();
    return Array.isArray(items) ? items.length : 0;
  }

  async add(item) {
    const items = await this.getAll();
    const safeItems = Array.isArray(items) ? items : [];
    const newItem = {
      ...item,
      id: item?.id || Date.now() + Math.random().toString(36).substr(2, 9),
    };
    safeItems.push(newItem);
    await this.setAll(safeItems);
    return newItem.id;
  }

  async put(item) {
    if (!item) return;
    const items = await this.getAll();
    const safeItems = Array.isArray(items) ? [...items] : [];
    const id = item.id || Date.now() + Math.random().toString(36).substr(2, 9);
    const itemWithId = { ...item, id };
    const index = safeItems.findIndex((i) => i && i.id === id);
    if (index !== -1) {
      safeItems[index] = itemWithId;
    } else {
      safeItems.push(itemWithId);
    }
    await this.setAll(safeItems);
    return id;
  }

  async update(id, updates) {
    const items = await this.getAll();
    const safeItems = Array.isArray(items) ? items : [];
    const index = safeItems.findIndex((i) => i && i.id === id);
    if (index !== -1) {
      safeItems[index] = { ...safeItems[index], ...updates };
      await this.setAll(safeItems);
      return 1;
    }
    return 0;
  }

  async delete(id) {
    const items = await this.getAll();
    const safeItems = Array.isArray(items) ? items : [];
    const newItems = safeItems.filter((i) => i && i.id !== id);
    await this.setAll(newItems);
  }

  async clear() {
    await this.setAll([]);
  }

  where(field) {
    return {
      equals: (value) => {
        const executeFilter = async () => {
          const items = await this.getAll();
          const safeItems = Array.isArray(items) ? items : [];
          return safeItems.filter((i) => i && i[field] === value);
        };

        return {
          first: async () => {
            const items = await executeFilter();
            return items[0] || null;
          },
          toArray: async () => {
            return await executeFilter();
          },
          count: async () => {
            const items = await executeFilter();
            return items.length;
          },
          delete: async () => {
            const items = await this.getAll();
            const safeItems = Array.isArray(items) ? items : [];
            const newItems = safeItems.filter((i) => i && i[field] !== value);
            await this.setAll(newItems);
          },
          sortBy: async (sortField) => {
            const items = await executeFilter();
            return [...items].sort((a, b) => (a?.[sortField] > b?.[sortField] ? 1 : -1));
          },
          reverse: () => {
            return {
              sortBy: async (sortField) => {
                const items = await executeFilter();
                return [...items].sort((a, b) => (a?.[sortField] < b?.[sortField] ? 1 : -1));
              },
            };
          },
        };
      },
    };
  }

  orderBy(field) {
    return {
      last: async () => {
        const items = await this.getAll();
        const safeItems = Array.isArray(items) ? [...items] : [];
        if (safeItems.length === 0) return null;
        safeItems.sort((a, b) => (a?.[field] > b?.[field] ? 1 : -1));
        return safeItems[safeItems.length - 1];
      },
      first: async () => {
        const items = await this.getAll();
        const safeItems = Array.isArray(items) ? [...items] : [];
        if (safeItems.length === 0) return null;
        safeItems.sort((a, b) => (a?.[field] > b?.[field] ? 1 : -1));
        return safeItems[0];
      },
      toArray: async () => {
        const items = await this.getAll();
        const safeItems = Array.isArray(items) ? [...items] : [];
        return safeItems.sort((a, b) => (a?.[field] > b?.[field] ? 1 : -1));
      },
    };
  }

  async get(id) {
    const items = await this.getAll();
    return Array.isArray(items) ? (items.find((i) => i && i.id === id) || null) : null;
  }
}

export const db = {
  sessions: new Collection('sessions'),
  touches: new Collection('touches'),
  reflections: new Collection('reflections'),
};

export default db;
