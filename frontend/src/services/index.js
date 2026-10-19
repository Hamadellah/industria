import api, { fetchCsrfCookie } from '../lib/api';

const unwrap = (res) => res.data;

export const authService = {
  async login(payload) {
    await fetchCsrfCookie();
    return unwrap(await api.post('/login', payload)).data;
  },
  async register(payload) {
    await fetchCsrfCookie();
    return unwrap(await api.post('/register', payload)).data;
  },
  logout: () => api.post('/logout'),
  me: async () => unwrap(await api.get('/user')).data,
  updateProfile: async (payload) => unwrap(await api.put('/profile', payload)).data,
};

export const productService = {
  list: async (params) => unwrap(await api.get('/products', { params })),
  get: async (id) => unwrap(await api.get(`/products/${id}`)).data,
  related: async (id) => unwrap(await api.get(`/products/${id}/related`)).data,
};

export const categoryService = {
  list: async () => unwrap(await api.get('/categories')).data,
  get: async (id) => unwrap(await api.get(`/categories/${id}`)).data,
};

export const favoriService = {
  list: async (params) => unwrap(await api.get('/favoris', { params })),
  ids: async () => unwrap(await api.get('/favoris/ids')).data,
  add: (productId) => api.post(`/favoris/${productId}`),
  remove: (productId) => api.delete(`/favoris/${productId}`),
};

export const cartService = {
  get: async () => unwrap(await api.get('/cart')),
  add: async (productId, quantity = 1) => unwrap(await api.post('/cart', { product_id: productId, quantity })),
  update: async (id, quantity) => unwrap(await api.patch(`/cart/${id}`, { quantity })),
  remove: async (id) => unwrap(await api.delete(`/cart/${id}`)),
  clear: () => api.delete('/cart'),
};

export const demandeService = {
  list: async (params) => unwrap(await api.get('/demandes', { params })),
  create: async (address) => unwrap(await api.post('/demandes', { address })).data,
};

// Les formulaires produits contiennent un fichier : multipart + _method pour la mise à jour.
const toFormData = (values) => {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'boolean') form.append(key, value ? '1' : '0');
    else form.append(key, value);
  });
  return form;
};

export const adminService = {
  stats: async () => unwrap(await api.get('/admin/stats')),

  products: async (params) => unwrap(await api.get('/admin/products', { params })),
  createProduct: async (values) => unwrap(await api.post('/admin/products', toFormData(values))).data,
  updateProduct: async (id, values) =>
    unwrap(await api.post(`/admin/products/${id}`, toFormData({ ...values, _method: 'PUT' }))).data,
  updateStock: async (id, stock) => unwrap(await api.patch(`/admin/products/${id}/stock`, { stock })).data,
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  categories: async (params) => unwrap(await api.get('/admin/categories', { params })),
  createCategory: async (name) => unwrap(await api.post('/admin/categories', { name })).data,
  updateCategory: async (id, name) => unwrap(await api.put(`/admin/categories/${id}`, { name })).data,
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  users: async (params) => unwrap(await api.get('/admin/users', { params })),
  updateRole: async (id, role) => unwrap(await api.patch(`/admin/users/${id}/role`, { role })).data,

  demandes: async (params) => unwrap(await api.get('/admin/demandes', { params })),
  validateDemande: async (id) => unwrap(await api.post(`/admin/demandes/${id}/validate`)).data,
  rejectDemande: async (id) => unwrap(await api.post(`/admin/demandes/${id}/reject`)).data,
};
