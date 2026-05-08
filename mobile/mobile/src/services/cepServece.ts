import axios from 'axios';

// Tipagem exata do que a API do ViaCEP retorna
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;         // Estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;     // O ViaCEP retorna { erro: true } se o CEP for inválido, mas tiver 8 dígitos
}

export const buscarCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  try {
    // Remove qualquer caractere que não seja número (ex: traços, pontos)
    const cepLimpo = cep.replace(/\D/g, '');

    // Validação de segurança: O CEP deve ter exatamente 8 números
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos.');
    }

    const response = await axios.get<ViaCEPResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    // Edge case: O ViaCEP não dá erro 404 para CEP inexistente (ex: 00000000), ele retorna 200 com { erro: true }
    if (response.data.erro) {
      throw new Error('CEP não encontrado.');
    }

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};