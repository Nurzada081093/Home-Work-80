import express from "express";
import {CategoryWithoutId, ICategory} from "../types";
import mysqlInventory from "../mysqlInventory";
import {ResultSetHeader} from "mysql2";

const categoriesRouter = express.Router();

categoriesRouter.get('/', async (_req, res, next) => {
    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT title, id FROM categories');
        const categories = result as ICategory[];

        res.send(categories);
    } catch (e) {
        next(e);
    }
});

categoriesRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Category not found');
    }

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
        const categories = result as ICategory[];

        if (categories.length === 0) {
            res.status(404).send("Category not found");
        } else {
            res.send(categories[0]);
        }

    } catch (e) {
        next(e);
    }
});

categoriesRouter.delete('/:id', async (req,res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Location not found');
    }

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
        const categories = result as ICategory[];

        if (categories.length === 0) {
            res.status(404).send("Category not found to delete!");
        }

        const [categoryResult] = await connection.query('SELECT * FROM items WHERE category_id = ?', [id]);
        const oneCategoryResult = categoryResult as ICategory[];

        if (oneCategoryResult.length > 0) {
            res.status(404).send("You can not delete this category! This category has a connection in items.");
        } else {
            await connection.query('DELETE FROM categories WHERE id = ?', [id]);
            res.send('This category has been successfully deleted!');
        }

    } catch (e) {
        next(e);
    }
});

categoriesRouter.post('/', async (req, res, next) => {

    if (!req.body.title) {
        res.status(400).send({error: 'Please send a title'});
        return;
    }

    const category: CategoryWithoutId = {
        title: req.body.title,
        description: req.body.description,
    };

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('INSERT INTO categories (title, description) VALUES (?, ?)', [category.title, category.description]);
        const resultHeader = result as ResultSetHeader;

        const [resultCategory] = await connection.query('SELECT * FROM categories WHERE id = ?', [resultHeader.insertId]);
        const oneCategory = resultCategory as ICategory[];

        if (oneCategory.length === 0) {
            res.status(404).send("Category not found");
        } else {
            res.send(oneCategory[0]);
        }

    } catch (e) {
        next(e);
    }
});

categoriesRouter.put('/:id', async (req,res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Category not found');
    }

    if (!req.body.title) {
        res.status(400).send({error: 'Please send a category title'});
        return;
    }

    try {
        const category = req.body;
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
        const categories = result as ICategory[];

        if (categories.length === 0) {
            res.status(404).send("Category not found to edit!");
        }

        await connection.query('UPDATE categories SET title = ?, description = ? WHERE id = ?', [category.title, category.description, id]);

        const [resultEditCategory] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
        const oneEditCategory = resultEditCategory as ICategory[];
        res.send(oneEditCategory[0]);

    } catch (e) {
        next(e);
    }

});

export default categoriesRouter;
