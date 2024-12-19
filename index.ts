import express from "express";
import cors from "cors";
import categoriesRouter from "./routers/categories";
import mysqlInventory from "./mysqlInventory";
import itemsRouter from "./routers/items";

const app = express();
const port = 8000;
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use('/categories', categoriesRouter);
// app.use('/locations', locationsRouter);
app.use('/items', itemsRouter);

const run = async () => {
    await mysqlInventory.init();

    app.listen(port, () => {
        console.log(`Server started on port http://localhost:${port}`);
    });
};

run().catch(err => console.log(err));