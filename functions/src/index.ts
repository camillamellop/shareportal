import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

initializeApp();

// Função para validar e calcular horas de voo
export const calculateFlightHours = onCall(async (request) => {
  const {horaPartida, horaChegada} = request.data;
  
  if (!horaPartida || !horaChegada) {
    throw new HttpsError("invalid-argument", "Hora de partida e chegada são obrigatórias");
  }
  
  try {
    const [horaPartidaHour, horaPartidaMin] = horaPartida.split(':').map(Number);
    const [horaChegadaHour, horaChegadaMin] = horaChegada.split(':').map(Number);
    
    const partida = horaPartidaHour * 60 + horaPartidaMin;
    const chegada = horaChegadaHour * 60 + horaChegadaMin;
    
    let diferencaMinutos = chegada - partida;
    
    // Se chegada for menor que partida, assumir que é no dia seguinte
    if (diferencaMinutos < 0) {
      diferencaMinutos += 24 * 60;
    }
    
    const horasVoo = diferencaMinutos / 60;
    
    return {
      horasVoo: Number(horasVoo.toFixed(2)),
      valido: horasVoo > 0 && horasVoo <= 16 // Máximo 16 horas de voo por dia
    };
  } catch (error) {
    throw new HttpsError("invalid-argument", "Formato de hora inválido");
  }
});

// Função para atualizar horas totais da aeronave quando um voo é criado
export const updateAircraftHours = onDocumentCreated("voos/{vooId}", async (event) => {
  const vooData = event.data?.data();
  if (!vooData) return;
  
  const db = getFirestore();
  
  try {
    const aeronaveRef = db.collection('aeronaves').doc(vooData.aeronave_id);
    const aeronaveDoc = await aeronaveRef.get();
    
    if (!aeronaveDoc.exists) {
      console.error(`Aeronave ${vooData.aeronave_id} não encontrada`);
      return;
    }
    
    const aeronaveData = aeronaveDoc.data();
    const novasHorasTotais = (aeronaveData?.horas_totais || 0) + vooData.horas_voo;
    
    await aeronaveRef.update({
      horas_totais: novasHorasTotais,
      updatedAt: new Date()
    });
    
    console.log(`Horas totais da aeronave ${vooData.aeronave_id} atualizadas para ${novasHorasTotais}`);
  } catch (error) {
    console.error("Erro ao atualizar horas da aeronave:", error);
  }
});

// Função para validar dados de voo
export const validateFlightData = onCall(async (request) => {
  const vooData = request.data;
  const errors: string[] = [];
  
  // Validações
  if (!vooData.data || !/^\d{4}-\d{2}-\d{2}$/.test(vooData.data)) {
    errors.push("Data inválida - formato esperado: YYYY-MM-DD");
  }
  
  if (!vooData.hora_partida || !/^\d{2}:\d{2}$/.test(vooData.hora_partida)) {
    errors.push("Hora de partida inválida - formato esperado: HH:MM");
  }
  
  if (!vooData.hora_chegada || !/^\d{2}:\d{2}$/.test(vooData.hora_chegada)) {
    errors.push("Hora de chegada inválida - formato esperado: HH:MM");
  }
  
  if (!vooData.origem || vooData.origem.length < 3) {
    errors.push("Origem deve ter pelo menos 3 caracteres");
  }
  
  if (!vooData.destino || vooData.destino.length < 3) {
    errors.push("Destino deve ter pelo menos 3 caracteres");
  }
  
  if (!vooData.piloto || vooData.piloto.length < 2) {
    errors.push("Nome do piloto é obrigatório");
  }
  
  if (!vooData.cotista || vooData.cotista.length < 2) {
    errors.push("Nome do cotista é obrigatório");
  }
  
  if (!vooData.horas_voo || vooData.horas_voo <= 0 || vooData.horas_voo > 16) {
    errors.push("Horas de voo deve ser entre 0.1 e 16 horas");
  }
  
  if (vooData.combustivel_inicial < 0 || vooData.combustivel_final < 0) {
    errors.push("Combustível não pode ser negativo");
  }
  
  if (vooData.combustivel_final > vooData.combustivel_inicial) {
    errors.push("Combustível final não pode ser maior que o inicial");
  }
  
  return {
    valido: errors.length === 0,
    erros: errors
  };
});

// Função para gerar relatório de horas de voo
export const generateFlightReport = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado");
  }
  
  const {aeronaveId, dataInicio, dataFim} = request.data;
  const db = getFirestore();
  
  try {
    const voosQuery = db.collection('voos')
      .where('aeronave_id', '==', aeronaveId)
      .where('data', '>=', dataInicio)
      .where('data', '<=', dataFim)
      .orderBy('data', 'desc');
    
    const voosSnapshot = await voosQuery.get();
    const voos = voosSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    
    const totalHoras = voos.reduce((total, voo) => total + (voo.horas_voo || 0), 0);
    const totalCombustivel = voos.reduce((total, voo) => 
      total + ((voo.combustivel_inicial || 0) - (voo.combustivel_final || 0)), 0);
    
    const pilotos = [...new Set(voos.map(voo => voo.piloto))];
    const destinos = [...new Set(voos.map(voo => voo.destino))];
    
    return {
      periodo: {dataInicio, dataFim},
      aeronave: aeronaveId,
      totalVoos: voos.length,
      totalHoras: Number(totalHoras.toFixed(2)),
      totalCombustivel: Number(totalCombustivel.toFixed(2)),
      pilotos,
      destinos,
      voos
    };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw new HttpsError("internal", "Erro interno do servidor");
  }
});

// Função para limpar dados antigos (executar periodicamente)
export const cleanupOldData = onRequest(async (req, res) => {
  const db = getFirestore();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    // Limpar mensagens antigas lidas
    const oldMessagesQuery = db.collection('messages')
      .where('readAt', '<', thirtyDaysAgo)
      .limit(100);
    
    const oldMessagesSnapshot = await oldMessagesQuery.get();
    
    const batch = db.batch();
    oldMessagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    res.json({
      success: true,
      deletedMessages: oldMessagesSnapshot.size,
      message: `${oldMessagesSnapshot.size} mensagens antigas foram removidas`
    });
  } catch (error) {
    console.error("Erro na limpeza:", error);
    res.status(500).json({error: "Erro interno do servidor"});
  }
});

// Função para notificar aniversários do dia
export const notifyBirthdays = onRequest(async (req, res) => {
  const db = getFirestore();
  const today = new Date();
  const todayString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  
  try {
    const birthdaysSnapshot = await db.collection('birthdays').get();
    const todayBirthdays = birthdaysSnapshot.docs
      .map(doc => ({id: doc.id, ...doc.data()}))
      .filter(birthday => {
        const [day, month] = birthday.data_aniversario.split('/');
        return `${day}/${month}` === todayString;
      });
    
    if (todayBirthdays.length > 0) {
      // Criar mensagem de aniversário
      const messageContent = todayBirthdays.map(b => 
        `🎉 ${b.nome}${b.empresa ? ` (${b.empresa})` : ''}`
      ).join('\n');
      
      await db.collection('messages').add({
        title: '🎂 Aniversários de Hoje',
        content: `Hoje fazem aniversário:\n\n${messageContent}`,
        sender: 'sistema',
        recipients: ['all'], // Enviar para todos
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        birthdays: todayBirthdays.length,
        names: todayBirthdays.map(b => b.nome)
      });
    } else {
      res.json({
        success: true,
        birthdays: 0,
        message: 'Nenhum aniversário hoje'
      });
    }
  } catch (error) {
    console.error("Erro ao notificar aniversários:", error);
    res.status(500).json({error: "Erro interno do servidor"});
  }
});