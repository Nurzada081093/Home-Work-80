import express from "express";
import {ILocation, LocationWithoutId} from "../types";
import mysqlInventory from "../mysqlInventory";
import {ResultSetHeader} from "mysql2";

const locationsRouter = express.Router();

locationsRouter.get('/', async (_req, res, next) => {
    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT title, id FROM locations');
        const locations = result as ILocation[];

        res.send(locations);
    } catch (e) {
        next(e);
    }
});

locationsRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Category not found');
    }

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);
        const locations = result as ILocation[];

        if (locations.length === 0) {
            res.status(404).send("Location not found");
        } else {
            res.send(locations[0]);
        }
    } catch (e) {
        next(e);
    }
});

locationsRouter.delete('/:id', async (req,res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Location not found');
    }

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);
        const locations = result as ILocation[];

        if (locations.length === 0) {
            res.status(404).send("Location not found to delete!");
        }

        const [locationResult] = await connection.query('SELECT * FROM items WHERE location_id = ?', [id]);
        const oneLocationResult = locationResult as ILocation[];

        if (oneLocationResult.length > 0) {
            res.status(404).send("You can not delete this location! This location has a connection in items.");
        } else {
            await connection.query('DELETE FROM locations WHERE id = ?', [id]);
            res.send('This location has been successfully deleted!');
        }

    } catch (e) {
        next(e);
    }
});

locationsRouter.post('/', async (req, res, next) => {

    if (!req.body.title) {
        res.status(400).send({error: 'Please send a title'});
        return;
    }

    const location: LocationWithoutId = {
        title: req.body.title,
        description: req.body.description,
    };

    try {
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('INSERT INTO locations (title, description) VALUES (?, ?)', [location.title, location.description]);
        const resultHeader = result as ResultSetHeader;

        const [resultLocation] = await connection.query('SELECT * FROM locations WHERE id = ?', [resultHeader.insertId]);
        const oneLocation = resultLocation as ILocation[];

        if (oneLocation.length === 0) {
            res.status(404).send("Location not found");
        } else {
            res.send(oneLocation[0]);
        }

    } catch (e) {
        next(e);
    }
});

locationsRouter.put('/:id', async (req,res, next) => {
    const id = req.params.id;

    if (!req.params.id) {
        res.status(404).send('Location not found');
    }

    if (!req.body.title) {
        res.status(400).send({error: 'Please send a location title'});
        return;
    }

    try {
        const location = req.body;
        const connection = await mysqlInventory.getConnection();
        const [result] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);
        const locations = result as ILocation[];

        if (locations.length === 0) {
            res.status(404).send("Location not found to edit!");
        }

        await connection.query('UPDATE locations SET title = ?, description = ? WHERE id = ?', [location.title, location.description, id]);

        const [resultEditLocation] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);
        const oneEditLocation = resultEditLocation as ILocation[];
        res.send(oneEditLocation[0]);

    } catch (e) {
        next(e);
    }

});

export default locationsRouter;