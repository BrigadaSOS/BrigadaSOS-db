import express, { Router } from "express";
import serverless from "serverless-http";

import { createServer } from "../../server";


async function handler() {
    const { app } = await createServer();
    return serverless(app);
}

export { handler };



