import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import db from "./src/db/index.ts";
import { analyzeContent, chatWithKnowledgeBase, generateDigest, findLocationOnMaps } from "./src/services/gemini.ts";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- API Routes ---

  // Get all items
  app.get("/api/items", (req, res) => {
    try {
      const items = db.prepare("SELECT * FROM saved_items ORDER BY created_at DESC").all();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // Update item
  app.patch("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const keys = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      db.prepare(`UPDATE saved_items SET ${setClause} WHERE id = ?`).run(...values, id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  // Delete item
  app.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM saved_items WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // --- User & Gamification Routes ---

  // Get User Data (Settings + Stats)
  app.get("/api/user", (req, res) => {
    try {
      const settings = db.prepare("SELECT * FROM user_settings WHERE id = 1").get();
      const stats = db.prepare("SELECT * FROM user_stats WHERE id = 1").get();
      
      // Get Badges
      const allBadges = db.prepare("SELECT * FROM badges").all();
      const earnedBadges = db.prepare("SELECT badge_id FROM user_badges WHERE user_id = 1").all().map((b: any) => b.badge_id);
      
      const badges = allBadges.map((badge: any) => ({
        ...badge,
        earned: earnedBadges.includes(badge.id)
      }));

      res.json({ settings, stats: { ...stats, badges } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  // Update Settings (Onboarding/Theme)
  app.post("/api/user/settings", (req, res) => {
    const { theme, onboarding_completed } = req.body;
    try {
      if (theme) {
        db.prepare("UPDATE user_settings SET theme_id = ? WHERE id = 1").run(theme);
      }
      if (onboarding_completed !== undefined) {
        db.prepare("UPDATE user_settings SET onboarding_completed = ? WHERE id = 1").run(onboarding_completed ? 1 : 0);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Gamification Logic Helper
  const checkBadges = (userId: number) => {
    const stats = db.prepare("SELECT * FROM user_stats WHERE id = ?").get(userId) as any;
    const badges = db.prepare("SELECT * FROM badges").all() as any[];
    const earned = db.prepare("SELECT badge_id FROM user_badges WHERE user_id = ?").all(userId).map((b: any) => b.badge_id);

    const newBadges = [];

    for (const badge of badges) {
      if (earned.includes(badge.id)) continue;

      let qualified = false;
      if (badge.condition_type === 'items_saved' && stats.items_saved >= badge.condition_value) qualified = true;
      if (badge.condition_type === 'items_remixed' && stats.items_remixed >= badge.condition_value) qualified = true;
      if (badge.condition_type === 'streak_days' && stats.streak_days >= badge.condition_value) qualified = true;

      if (qualified) {
        db.prepare("INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)").run(userId, badge.id);
        newBadges.push(badge);
      }
    }
    return newBadges;
  };

  // --- Profile Routes ---
  app.get("/api/profile", (req, res) => {
    try {
      const profile = db.prepare("SELECT * FROM user_profile WHERE user_id = 1").get();
      if (profile && profile.avatar_config) {
        profile.avatar_config = JSON.parse(profile.avatar_config);
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", (req, res) => {
    const { full_name, dob, phone, email, bio, is_public, social_links, avatar_config } = req.body;
    try {
      db.prepare(`
        UPDATE user_profile 
        SET full_name = ?, dob = ?, phone = ?, email = ?, bio = ?, is_public = ?, social_links = ?, avatar_config = ?
        WHERE user_id = 1
      `).run(
        full_name, 
        dob, 
        phone, 
        email, 
        bio, 
        is_public ? 1 : 0, 
        JSON.stringify(social_links),
        JSON.stringify(avatar_config)
      );
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Simulate WhatsApp Webhook / Add Item
  app.post("/api/items", async (req, res) => {
    const { url, content, source = 'whatsapp', mood } = req.body;
    
    try {
      // 1. Analyze with Gemini
      const analysis = await analyzeContent(url, content || "");
      
      // 2. Save to DB
      const stmt = db.prepare(`
        INSERT INTO saved_items (url, source, type, summary, tags, content, vibe, media_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const type = url.includes('instagram') ? 'social' : 'web';
      const mediaUrl = url.includes('instagram') 
        ? `https://picsum.photos/seed/${Math.random()}/400/400` 
        : null;

      const finalVibe = mood || analysis.vibe;

      const info = stmt.run(
        url, 
        source, 
        type, 
        analysis.summary, 
        JSON.stringify(analysis.tags), 
        content || finalVibe,
        finalVibe,
        mediaUrl
      );

      // 3. Update Stats & Gamification
      db.prepare("UPDATE user_stats SET items_saved = items_saved + 1, points = points + 10 WHERE id = 1").run();
      const newBadges = checkBadges(1);

      res.json({ success: true, id: info.lastInsertRowid, analysis, newBadges });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process item" });
    }
  });

  // --- Collections Routes ---
  app.get("/api/collections", (req, res) => {
    try {
      const collections = db.prepare("SELECT * FROM collections ORDER BY created_at DESC").all();
      // Get item counts
      const result = collections.map((c: any) => {
        const count = db.prepare("SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ?").get(c.id) as any;
        return { ...c, count: count.count };
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.post("/api/collections", (req, res) => {
    const { name, icon, color, description } = req.body;
    try {
      const info = db.prepare("INSERT INTO collections (name, icon, color, description) VALUES (?, ?, ?, ?)").run(name, icon, color, description);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create collection" });
    }
  });

  app.post("/api/collections/:id/items", (req, res) => {
    const { itemId } = req.body;
    try {
      db.prepare("INSERT OR IGNORE INTO collection_items (collection_id, item_id) VALUES (?, ?)").run(req.params.id, itemId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add to collection" });
    }
  });

  app.get("/api/collections/:id/items", (req, res) => {
    try {
      const items = db.prepare("SELECT item_id FROM collection_items WHERE collection_id = ?").all(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection items" });
    }
  });

  // --- Insights & Extras ---
  app.get("/api/insights", (req, res) => {
    try {
      const topTags = db.prepare(`
        SELECT value as tag, COUNT(*) as count 
        FROM saved_items, json_each(tags) 
        GROUP BY value 
        ORDER BY count DESC 
        LIMIT 5
      `).all();
      
      const topVibes = db.prepare(`
        SELECT vibe, COUNT(*) as count 
        FROM saved_items 
        WHERE vibe IS NOT NULL 
        GROUP BY vibe 
        ORDER BY count DESC 
        LIMIT 5
      `).all();

      res.json({ topTags, topVibes });
    } catch (error) {
      // Fallback if json_each not supported or empty
      res.json({ topTags: [], topVibes: [] });
    }
  });

  app.get("/api/daily-tip", async (req, res) => {
    // In a real app, we'd generate this daily and cache it.
    // For demo, we'll generate it on fly or return a random one.
    const tips = [
      "Organize your 'Food' saves into a 'Weekly Meal Plan' collection.",
      "Use the 'Remix' feature to turn your travel photos into a video reel.",
      "Ask the Chat Assistant to summarize your last 5 saved articles.",
      "Review your 'Read Later' items every Friday to keep your list clean."
    ];
    res.json({ tip: tips[Math.floor(Math.random() * tips.length)] });
  });

  // Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    try {
      // Fetch context
      const items = db.prepare("SELECT * FROM saved_items LIMIT 20").all();
      
      // Use Gemini with Search Grounding if it's a general query
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `
          Knowledge Base Context:
          ${items.map(item => `- [${item.type}] ${item.summary} (Tags: ${item.tags})`).join('\n')}
          
          User Query: ${message}
          
          Answer the user's question. If you need current web information, use Google Search.
        `,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      res.json({ 
        response: response.text,
        grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // Digest Route
  app.post("/api/digest", async (req, res) => {
    try {
      // In a real app, filter by date. For demo, take last 10 items.
      const items = db.prepare("SELECT * FROM saved_items ORDER BY created_at DESC LIMIT 10").all();
      
      if (items.length === 0) {
        return res.json({ digest: "No items saved yet! Start saving to get your weekly rewind." });
      }

      const digest = await generateDigest(items);
      res.json({ digest });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate digest" });
    }
  });

  app.post("/api/locate", async (req, res) => {
    const { itemId, locationHint } = req.body;
    try {
      const result = await findLocationOnMaps(locationHint);
      if (result) {
        db.prepare("UPDATE saved_items SET location_data = ? WHERE id = ?").run(JSON.stringify(result), itemId);
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to locate" });
    }
  });

  // --- Tag Management Routes ---
  app.get("/api/tags", (req, res) => {
    try {
      const tags = db.prepare(`
        SELECT value as name, COUNT(*) as count 
        FROM saved_items, json_each(tags) 
        GROUP BY value 
        ORDER BY count DESC
      `).all();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  app.put("/api/tags/:oldName", (req, res) => {
    const { oldName } = req.params;
    const { newName } = req.body;
    try {
      const items = db.prepare("SELECT id, tags FROM saved_items WHERE tags LIKE ?").all(`%${oldName}%`);
      const stmt = db.prepare("UPDATE saved_items SET tags = ? WHERE id = ?");
      
      let updatedCount = 0;
      for (const item of items) {
        let tags = JSON.parse(item.tags);
        if (tags.includes(oldName)) {
          tags = tags.map((t: string) => t === oldName ? newName : t);
          stmt.run(JSON.stringify(tags), item.id);
          updatedCount++;
        }
      }
      res.json({ success: true, updatedCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to rename tag" });
    }
  });

  app.delete("/api/tags/:name", (req, res) => {
    const { name } = req.params;
    try {
      const items = db.prepare("SELECT id, tags FROM saved_items WHERE tags LIKE ?").all(`%${name}%`);
      const stmt = db.prepare("UPDATE saved_items SET tags = ? WHERE id = ?");
      
      let updatedCount = 0;
      for (const item of items) {
        let tags = JSON.parse(item.tags);
        if (tags.includes(name)) {
          tags = tags.filter((t: string) => t !== name);
          stmt.run(JSON.stringify(tags), item.id);
          updatedCount++;
        }
      }
      res.json({ success: true, updatedCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });

  app.post("/api/edit-image", async (req, res) => {
    const { imageUrl, prompt } = req.body;
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API Key missing" });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Fetch image as base64
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/png';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: prompt }
                ]
            }
        });

        let editedImageUrl = null;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                editedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (editedImageUrl) {
            res.json({ imageUrl: editedImageUrl });
        } else {
            res.status(500).json({ error: "Image editing failed" });
        }
    } catch (error) {
        console.error("Image Edit Error:", error);
        res.status(500).json({ error: "Image editing failed" });
    }
  });

  app.post("/api/generate-video", async (req, res) => {
    const { prompt } = req.body;
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API Key missing" });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // Note: This is a placeholder for the actual Veo call structure
        // In a real implementation, we would handle the operation polling here
        // For the hackathon demo, we might need to simplify or handle the async nature on the client
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p', 
                aspectRatio: '16:9'
            }
        });
        
        // We return the operation to the client to poll, or we poll here.
        // Let's poll here for simplicity of the frontend, but with a timeout
        let retries = 0;
        while (!operation.done && retries < 30) { // 30 seconds max wait for this simple endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            operation = await ai.operations.getVideosOperation({operation: operation});
            retries++;
        }

        if (operation.done && operation.response?.generatedVideos?.[0]?.video?.uri) {
             res.json({ videoUri: operation.response.generatedVideos[0].video.uri });
        } else {
             // If it takes too long, return the operation name so client can continue polling (not implemented in this simple demo)
             res.status(202).json({ status: "processing", operationName: operation.name });
        }

    } catch (error) {
        console.error("Veo Error:", error);
        res.status(500).json({ error: "Video generation failed" });
    }
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
