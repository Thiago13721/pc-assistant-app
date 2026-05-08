// Você pode colocar isso num arquivo src/utils/masks.ts
export const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é número
    .replace(/^(\d{5})(\d)/, '$1-$2') // Coloca o traço após os 5 primeiros números
    .slice(0, 9); // Trava o tamanho máximo em 9 caracteres (12345-678)
};