import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { runAssistant } from "./agent/orchestrator";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  assistant: router({
    chat: publicProcedure
      .input(
        z.object({
          text: z.string().trim().min(1, "Message is required").max(8000, "Message is too long"),
          history: z.array(chatTurnSchema).max(8).default([]),
        }),
      )
      .mutation(({ input }) => runAssistant(input)),
    transcribe: publicProcedure
      .input(
        z.object({
          audioBase64: z.string().min(1).max(8_500_000),
          mimeType: z.enum(["audio/m4a", "audio/mp4", "audio/webm", "audio/wav"]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const bytes = Buffer.from(input.audioBase64, "base64");
        if (bytes.byteLength > 6 * 1024 * 1024) {
          throw new Error("Voice clip is too large. Please record a shorter clip.");
        }
        const ext = input.mimeType === "audio/webm" ? "webm" : input.mimeType === "audio/wav" ? "wav" : "m4a";
        const { url } = await storagePut(`voice-transcriptions/${crypto.randomUUID()}.${ext}`, bytes, input.mimeType);
        const host = ctx.req.get("host");
        const origin = host ? `${ctx.req.protocol}://${host}` : "";
        const transcription = await transcribeAudio({ audioUrl: `${origin}${url}` });
        if (!("text" in transcription)) {
          throw new Error("Voice transcription is temporarily unavailable.");
        }
        return { text: transcription.text, language: transcription.language ?? "und" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
