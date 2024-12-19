import express from "express";
import {ICategory} from "../types";
import mysqlInventory from "../mysqlInventory";

const categoriesRouter = express.Router();

categoriesRouter.get('/', async (req, res, next) => {
    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM categories');
        // const [result] = await connection.query('SELECT title, id FROM categories');
        const categories = result as ICategory[];

        res.send(categories);
    } catch (e) {
        next(e);
    }
});

export default categoriesRouter;