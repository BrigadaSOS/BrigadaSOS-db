// @ts-nocheck
import express from "express";
export const router = express.Router();

import { authenticate } from "../middleware/authentication";
import { rateLimitApiQuota } from "../middleware/apiLimiter"
import { getAllMedia } from "../controllers/mediaController";
import { hasPermissionAPI } from "../middleware/permissionHandler";
import { GetContextAnime, SearchAnimeSentences, GetWordsMatched, updateSegment } from "../controllers/mediaController";

// Get
router.get('/v1/search/media/info', authenticate({ apiKey: true }), hasPermissionAPI(['READ_MEDIA']), getAllMedia)

// Post
router.post("/v1/search/media/sentence", authenticate({ apiKey: true }), hasPermissionAPI(['READ_MEDIA']), rateLimitApiQuota, SearchAnimeSentences);
router.post("/v1/search/media/context", authenticate({ apiKey: true }), hasPermissionAPI(['READ_MEDIA']), GetContextAnime);
router.post('/v1/search/media/match/words', authenticate({ apiKey: true }), hasPermissionAPI(['READ_MEDIA']), GetWordsMatched)