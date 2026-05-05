import { create } from 'zustand';

// Os nomes devem bater com os do MOCK_PRODUCTS da sua Category.tsx
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

export interface CartItem extends Product {
  quantity: number;
}

interface AppState {
  pcBuild: Partial<Record<CategoryName, Product>>;
  setBuildItem: (category: CategoryName, product: Product) => void;
  removeBuildItem: (category: CategoryName) => void;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  // --- PC BUILD ---
  pcBuild: {},
  
  setBuildItem: (category, product) =>
    set((state) => ({
      pcBuild: { ...state.pcBuild, [category]: product },
    })),
    
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
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
    
  updateQuantity: (productId, delta) =>
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0), // Remove se a quantidade for 0
    })),
    
  clearCart: () => set({ cart: [] }),
}));