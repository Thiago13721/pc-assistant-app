import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Tipagens ---
export type CategoryName = 'Processadores' | 'Placas Mãe' | 'Memória RAM' | 'Placas de Vídeo' | 'Armazenamento' | 'Fontes' | 'Gabinetes' | 'Coolers' | string;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  specs: Record<string, string>;
}

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  cep?: string | null;
  address?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
  items: CartItem[];
  paymentMethod: 'PIX' | 'CREDIT_CARD';
}

export interface SavedBuild {
  id: string;
  name: string;
  createdAt: string;
  total: number;
  itemCount: number;
  items: Partial<Record<CategoryName, Product>>;
}
export interface Address {
  id: string;
  label: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface AppState {
  // Usuário autenticado
  user: LoggedUser | null;
  token: string | null;
  setUser: (user: LoggedUser | null, token?: string) => void;
  logout: () => void;

  // PC Build
  pcBuild: Partial<Record<CategoryName, Product>>;
  setBuildItem: (category: CategoryName, product: Product) => void;
  removeBuildItem: (category: CategoryName) => void;
  

  // Carrinho
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;

  // Pedidos
  orders: Order[];
  addOrder: (cart: CartItem[], total: number, paymentMethod: 'PIX' | 'CREDIT_CARD') => void;

  // Endereços
  addresses: Address[];
  selectedAddressId: string | null;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;

  savedBuilds: SavedBuild[];
  saveBuild: (name: string, build: Partial<Record<CategoryName, Product>>) => void;
  removeSavedBuild: (id: string) => void;

}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // --- USUÁRIO ---
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token: token || null }),
      logout: () => set({
        user: null, token: null, cart: [], orders: [],
        pcBuild: {}, addresses: [], selectedAddressId: null, savedBuilds: [],
      }),

      // --- PC BUILD ---
      pcBuild: {},
      setBuildItem: (category, product) =>
        set((state) => ({ pcBuild: { ...state.pcBuild, [category]: product } })),
      removeBuildItem: (category) =>
        set((state) => {
          const newBuild = { ...state.pcBuild };
          delete newBuild[category];
          return { pcBuild: newBuild };
        }),

      // --- CARRINHO ---
      cart: [],
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) })),
      updateQuantity: (productId, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
            .filter((item) => item.quantity > 0),
        })),
      clearCart: () => set({ cart: [] }),

      // --- PEDIDOS ---
      orders: [],
      addOrder: (cart, total, paymentMethod) =>
        set((state) => {
          const newOrder: Order = {
            id: `ord_${Date.now()}`,
            createdAt: new Date().toISOString(),
            total,
            status: 'PAID',
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            items: cart,
            paymentMethod,
          };
          return { orders: [newOrder, ...state.orders] };
        }),

      // --- ENDEREÇOS ---
      addresses: [
        {
          id: 'addr_default',
          label: 'Casa',
          cep: '01000000',
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
      ],
      selectedAddressId: 'addr_default',
      addAddress: (address) =>
        set((state) => {
          const newAddress: Address = { ...address, id: `addr_${Date.now()}` };
          const isFirst = state.addresses.length === 0;
          return {
            addresses: [...state.addresses, newAddress],
            selectedAddressId: isFirst ? newAddress.id : state.selectedAddressId,
          };
        }),
      removeAddress: (id) =>
        set((state) => {
          const filtered = state.addresses.filter((a) => a.id !== id);
          return {
            addresses: filtered,
            selectedAddressId:
              state.selectedAddressId === id
                ? filtered[0]?.id ?? null
                : state.selectedAddressId,
          };
        }),
      selectAddress: (id) => set({ selectedAddressId: id }),

      // --- BUILDS SALVAS ---
      savedBuilds: [],
      saveBuild: (name, build) =>
        set((state) => {
          const items = Object.values(build).filter(Boolean) as Product[];
          const newBuild: SavedBuild = {
            id: `build_${Date.now()}`,
            name,
            createdAt: new Date().toISOString(),
            total: items.reduce((sum, p) => sum + p.price, 0),
            itemCount: items.length,
            items: build,
          };
          return { savedBuilds: [newBuild, ...state.savedBuilds] };
        }),
      removeSavedBuild: (id) =>
        set((state) => ({
          savedBuilds: state.savedBuilds.filter(b => b.id !== id),
        })),
    }),
    {
      name: 'pc-assistant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
    
