import {connect, set} from "mongoose"
import {MongoClient, ObjectId} from "mongodb"
import dotenv from 'dotenv';

dotenv.config()

const URLDB = process.env.URLDB


const connectMongoDb = async () => {
    try {
        await connect(URLDB as string)
        console.log("Conectado con exito!!!")
    } catch (error) {
        console.log("Error al conectarse a mongoDB")
    }
}

const client = new MongoClient(URLDB as string)

const db = client.db("biblioteca")
const productos = db.collection("libros")

const argumentos = process.argv.splice(2)
const accion = argumentos[0]
const id = argumentos[1]

const leerProductos = async () => {
    const data = await productos.find().toArray()
    return data
}

const agregarProducto = async (titulo: string, autor: string, precio: number, stock: number) => {
    const nuevoProducto = {titulo, autor, precio, stock}
    const resultado = productos.insertOne(nuevoProducto)
    return productos.findOne({_id: new ObjectId((await resultado).insertedId)})
}

const borrarProducto = async (id: ObjectId) => {
    const productoABorrrar = await productos.findOne({_id: new ObjectId(id)})
    console.log("El producto a borrar va a ser: ", productoABorrrar)
    await productos.deleteOne({_id: new ObjectId(id)})
}

interface IProducto {
    titulo: string
    autor: string
    precio: number
    stock: number
}

const actualizarProducto = async (id: ObjectId, actualizaciones: string[]) => { 
    const nuevaInfo: Partial<IProducto> = {}

    for (let index = 0; index < actualizaciones.length; index=index+2) {
        const propiedadAActualizar = actualizaciones[index]?.replace("--","")
        const valorDePropAActualizar = actualizaciones[index+1]
        
        if (propiedadAActualizar === "precio" || propiedadAActualizar === "stock") {
            nuevaInfo[propiedadAActualizar] = Number(valorDePropAActualizar)
        } else {
            nuevaInfo[propiedadAActualizar as keyof IProducto] = valorDePropAActualizar as never
        }
    }

    return productos.updateOne({_id: id}, {$set: nuevaInfo})
}

switch (accion) {
    case "info":
        console.log(`
            read: leer productos existente
            create: crea un producto nuevo
            update: actualiza un producto existente
            delete: borra un producto existente
        `)
        break

    case "read":    
    console.log(await leerProductos())
    process.exit(1)

    case "delete":
        await borrarProducto(id)
        process.exit(1)

    case "update":
        console.log(await actualizarProducto(new ObjectId(id), argumentos.splice(2)))
        const productoActualizado = await productos.findOne({_id: new ObjectId(id)})
        console.log("El producto quedo asi: ", productoActualizado)
        process.exit(1)

    case "create":
        // titulo, autor, precio, stock
        const titulo = argumentos[1]
        const autor = argumentos[2]
        const precio = Number(argumentos[3])
        const stock = Number(argumentos[4])
        console.log("Se agrego el producto: ", await agregarProducto(titulo, autor, precio, stock))
        process.exit(1)
    
    default:
        console.log("comando no encontrado. Utilice el comando info para manual de comandos")
}