import express from "express";
import {imagesUpload} from "../multer";
import {ResultSetHeader} from "mysql2";
import mysqlInventory from "../mysqlInventory";
import {Item, ItemWithoutId} from "../types";

const itemsRouter = express.Router();

itemsRouter.get('/', async (_req, res, next) => {
    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT i.id, i.title, i.category_id, i.location_id FROM items AS i');
        const items = result as Item[];

        res.send(items);
    } catch (e) {
        next(e);
    }
});

itemsRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Item not found');
    }

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
        const items = result as Item[];

        if (items.length === 0) {
            res.status(404).send("Item not found");
        } else {
            res.send(items[0]);
        }

    } catch (e) {
        next(e);
    }
});

itemsRouter.delete('/:id', async (req,res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Item not found');
    }

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
        const items = result as Item[];

        if (items.length === 0) {
            res.status(404).send("Item not found to delete!");
        } else {
            await connection.query('DELETE FROM items WHERE id = ?', [id]);
            res.send('This item has been successfully deleted!');
        }

    } catch (e) {
        next(e);
    }
});

itemsRouter.post('/', imagesUpload.single('image'),  async (req, res, next) => {

    if (!req.body.title || !req.body.category_id || !req.body.location_id) {
        res.status(400).send({error: 'Please send a title, category_id and location_id'});
        return;
    }

    const item: ItemWithoutId = {
        category_id: Number(req.body.category_id),
        location_id: Number(req.body.location_id),
        title: req.body.title,
        description: req.body.description,
        image: req.file ? 'images' + req.file.filename : null,
    };

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('INSERT INTO items (category_id, location_id, title, description, image) VALUES (?, ?, ?, ?, ?)', [item.category_id, item.location_id, item.title, item.description, item.image]);
        const resultHeader = result as ResultSetHeader;

        const [resultItem] = await connection.query('SELECT * FROM items WHERE id = ?', [resultHeader.insertId]);
        const oneItem = resultItem as Item[];

        if (oneItem.length === 0) {
            res.status(404).send("Item not found");
        } else {
            res.send(oneItem[0]);
        }

    } catch (e) {
        next(e);
    }
});

itemsRouter.put('/:id', imagesUpload.single('image'), async (req,res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Category not found');
    }

    if (!req.body.title || !req.body.category_id || !req.body.location_id) {
        res.status(400).send({error: 'Please send a title, category_id and location_id'});
        return;
    }

    try {
        const item = req.body;
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
        const items = result as Item[];

        if (items.length === 0) {
            res.status(404).send("Item not found to edit!");
        }

        await connection.query('UPDATE items SET category_id = ?, location_id = ?, title = ?, description = ?, image = ? WHERE id = ?', [item.category_id, item.location_id, item.title, item.description, item.image, id]);

        const [resultEditItem] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
        const oneEditItem= resultEditItem as Item[];
        res.send(oneEditItem[0]);

    } catch (e) {
        next(e);
    }

});

export default itemsRouter;
