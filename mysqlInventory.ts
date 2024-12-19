import mysql, {Connection} from "mysql2/promise";
import config from "./config";

let connection: Connection;

const mysqlInventory = {
    async init () {
        connection = await mysql.createConnection(config.dataBase);
    },

    async getConnection () {
        return connection;
    },
};

export default mysqlInventory;