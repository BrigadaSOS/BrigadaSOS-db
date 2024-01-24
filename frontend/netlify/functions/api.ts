import express, { Router } from "express";
import serverless from "serverless-http";

import {createServer} from "../../server";
const api = express();

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

api.use("/api/", router);
createServer()

export const handler = serverless(api);

