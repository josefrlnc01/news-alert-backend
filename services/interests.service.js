
import { InterestsModel } from "../models/interests.js";
import { AiProvider } from "../providers/AiProvider.js";

export class InterestsService{
    static async addInterest ({user, theme}) {
        if (!theme || typeof theme !== 'string' || !theme.trim()) {
         throw new Error('Theme is required and must be a non-empty string')
        }

        if(!user){
            throw new Error ('Error al obtener el usuario')
        }
        return InterestsModel.addInterest({user, theme})
    }


    static async deleteInterest({interestId}) {
        if (!interestId) {
            throw new Error ('Id incorrecto')
        }
        return InterestsModel.deleteInterest({interestId})
    }


    static async getInterests({user}){
        if(!user){
            throw new Error ('Error al obtener el usuario')
        }
        return InterestsModel.getInterests({user})
    }

    static async generateInterestByAI ({prompt}) {
        if (!prompt) {
            throw new Error ('No hay prompt')
        }
        const raw = await AiProvider.generateInterests({prompt})
        // Encuentra el JSON dentro de las etiquetas
        const match = raw.match(/<JSON>([\s\S]*?)<\/JSON>/);

        if (!match) {
            console.error("RAW AI RESPONSE:", raw);
            throw new Error("No se encontró el bloque JSON en la respuesta de la IA");
        }

        // Esto es lo único que se parsea
        const onlyJson = match[1].trim();   

        // Aquí SÍ puedes parsear
        const data = JSON.parse(onlyJson);
        console.log(data)
        return data
    }
}