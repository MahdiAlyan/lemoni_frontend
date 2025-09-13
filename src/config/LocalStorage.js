class LocalStorage {
  setStorage(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
  }

  removeStorage(name) {
    localStorage.removeItem(name);
  }

  getStorage(name) {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  }

  checkStorage(name) {
    return localStorage.getItem(name) !== null;
  }

  clearStorage() {
    localStorage.clear();
  }

  // Initialize cart if not already present
  initializeCart() {
    if (!this.checkStorage('cart')) {
      this.setStorage('cart', []);
    }
  }
}

export default new LocalStorage();
