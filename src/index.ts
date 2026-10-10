import {connect} from "mongoose"

const connectMongoDb = async () => {
    try {
        await connect("mongodb+srv://matiuescu12_db_user:KtX9BFJnFOsKumtg@proyectos.mqrty9u.mongodb.net/")
        console.log("Conectado con exito!!!")
    } catch (error) {
        console.log("Error al conectarse a mongoDB")
    }
}


connectMongoDb()