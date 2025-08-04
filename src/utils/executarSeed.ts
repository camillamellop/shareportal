import { seedAeronaves } from "./seedAeronaves";
import { seedVoos } from "./seedVoos";
import { seedBirthdays } from "./seedBirthdays";
import { seedHotels } from "./seedHotels";
import { aeronaveService, vooService, birthdayService, hotelService } from "@/services/firestore";

export const executarSeedCompleto = async () => {
  try {
    console.log("=== INICIANDO SEED COMPLETO ===");
    
    // Limpar dados existentes
    console.log("Limpando dados existentes...");
    await limparDadosExistentes();
    
    // Executar seed de aeronaves
    await seedAeronaves();
    
    // Executar seed de voos para PT-WSR
    await seedVoos("PT-WSR");
    
    // Executar seed de aniversários
    await seedBirthdays();
    
    // Executar seed de hotéis
    await seedHotels();
    
    console.log("=== SEED COMPLETO FINALIZADO ===");
  } catch (error) {
    console.error("Erro durante o seed:", error);
  }
};

// Função para limpar dados existentes
export const limparDadosExistentes = async () => {
  try {
    // Limpar voos
    const voos = await vooService.getAll();
    for (const voo of voos) {
      await vooService.delete(voo.id);
    }
    console.log("Voos limpos");
    
    // Limpar aeronaves
    const aeronaves = await aeronaveService.getAll();
    for (const aeronave of aeronaves) {
      await aeronaveService.delete(aeronave.id);
    }
    console.log("Aeronaves limpas");
    
    // Limpar aniversários
    const aniversarios = await birthdayService.getAll();
    for (const aniversario of aniversarios) {
      await birthdayService.delete(aniversario.id);
    }
    console.log("Aniversários limpos");
    
    // Limpar hotéis
    const hoteis = await hotelService.getAll();
    for (const hotel of hoteis) {
      await hotelService.delete(hotel.id);
    }
    console.log("Hotéis limpos");
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
  }
};

// Função para verificar se já existem aeronaves
export const verificarAeronavesExistentes = async () => {
  try {
    const aeronaves = await aeronaveService.getAll();
    console.log("Aeronaves existentes:", aeronaves.length);
    return aeronaves.length > 0;
  } catch (error) {
    console.error("Erro ao verificar aeronaves:", error);
    return false;
  }
}; 