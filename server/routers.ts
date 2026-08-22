import { COOKIE_NAME } from "../shared/const.js";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";
import { extractCitations, selectOrbitModel, systemPromptFor, type OrbitMode } from "./orbit-service";

const safeErrorMessage = (error: unknown) => error instanceof Error ? error.message.replace(/Bearer\s+[^\s]+/gi, "[redacted]").slice(0, 280) : "An unexpected service error occurred.";

async function runOrbitAssistant(input: { prompt: string; mode: OrbitMode; agentMode?: boolean }) {
  try {
    const catalog = await listLLMModels();
    const model = selectOrbitModel(catalog.data.map((item) => item.id));
    let result = await invokeLLM({
      model,
      messages: [
        { role: "system", content: systemPromptFor(input.mode, input.agentMode) },
        { role: "user", content: input.prompt },
      ],
      tools: input.mode === "research" ? ([{ type: "web_search" }] as never) : undefined,
      toolChoice: input.mode === "research" ? "auto" : undefined,
      maxTokens: input.mode === "research" ? 1400 : 1000,
    });
    let text = typeof result.choices[0]?.message.content === "string"
      ? result.choices[0].message.content.trim()
      : "";
    if (!text && input.mode === "research") {
      result = await invokeLLM({
        model,
        messages: [
          { role: "system", content: systemPromptFor("research") },
          { role: "user", content: `${input.prompt}\n\nReturn a final plain-text answer with direct source URLs; do not leave the response empty.` },
        ],
        tools: [{ type: "web_search" }] as never,
        toolChoice: "auto",
        maxTokens: 1400,
      });
      text = typeof result.choices[0]?.message.content === "string"
        ? result.choices[0].message.content.trim()
        : "";
    }
    if (!text) throw new Error("The AI service returned no readable content.");
    return { status: "COMPLETED" as const, text, model: result.model || model || "runtime default", citations: extractCitations(text) };
  } catch (error) {
    return {
      status: "BLOCKED" as const,
      text: `Orbit could not complete this secure AI request. No answer has been represented as verified. Details: ${safeErrorMessage(error)}`,
      model: null,
      citations: [] as string[],
    };
  }
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  assistant: router({
    respond: publicProcedure
      .input(z.object({
        prompt: z.string().trim().min(1).max(2_000),
        mode: z.enum(["chat", "research"]),
        agentMode: z.boolean().default(false),
      }))
      .mutation(({ input }) => runOrbitAssistant(input)),
    capabilities: publicProcedure.query(async () => {
      try {
        const catalog = await listLLMModels();
        return { available: true, modelIds: catalog.data.map((item) => item.id), selected: selectOrbitModel(catalog.data.map((item) => item.id)) ?? null };
      } catch {
        return { available: false, modelIds: [], selected: null };
      }
    }),
  }),
  document: router({
    analyzeText: publicProcedure
      .input(z.object({ filename: z.string().trim().min(1).max(180), mimeType: z.string().max(100), text: z.string().trim().min(1).max(12_000) }))
      .mutation(({ input }) => runOrbitAssistant({
        mode: "document",
        prompt: `Document: ${input.filename}\nMIME type: ${input.mimeType}\n\n--- BEGIN DOCUMENT TEXT ---\n${input.text}\n--- END DOCUMENT TEXT ---\n\nGive a concise, source-grounded summary with key actions and uncertainties.`,
      })),
  }),
  voice: router({
    transcribe: publicProcedure
      .input(z.object({ audioDataUrl: z.string().regex(/^data:audio\/[a-z0-9.+-]+;base64,/i).max(900_000) }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({ audioUrl: input.audioDataUrl, language: "en", prompt: "Transcribe the user's request exactly and clearly." });
        if ("error" in result) return { status: "BLOCKED" as const, text: "", reason: result.error };
        return { status: "COMPLETED" as const, text: result.text, language: result.language, duration: result.duration };
      }),
  }),
});

export type AppRouter = typeof appRouter;
