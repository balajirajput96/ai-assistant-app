# Google Play Release Handoff

## Current Build Readiness

The project is configured as an Android-first Expo application. `app.config.ts` sets Android `compileSdkVersion` and `targetSdkVersion` to 36, consistent with the identified API target requirement for new Play submissions from 31 August 2026. [1]

| Release area | Current state | Owner action needed before submission |
| --- | --- | --- |
| Android artifact | Source is prepared; no signed artifact has been generated in this environment. | Create a checkpoint, then use the project Publish action to trigger the managed Android release workflow. |
| Google Play Console | Not connected or authorized. | Create/select app, configure package name, grant required release permissions, and complete signing enrollment. |
| Store listing | Draft documentation only. | Supply title, short/long descriptions, category, support email, privacy-policy URL, and authentic device screenshots. |
| Data safety | Product data inventory drafted. | Complete Play Console declarations with the final production retention and SDK details. |
| Generative AI | In-app reporting guidance present. | Confirm the production moderation/reporting path and required policy disclosures. |
| Testing | Type check, task-domain tests, service-helper tests, secure chat smoke test, and cited research smoke test passed. | Test voice, document selection, notifications, and AI flows on a physical Android release build. |

## Submission Gate

Do not submit this app until all remaining handoff actions are complete, particularly the public privacy-policy URL, signed artifact, physical-device validation, final Google Play policy review, and real operator ownership details.

## Reference

[1]: https://support.google.com/googleplay/android-developer/answer/11926878?hl=en "Target API level requirements for Google Play apps"
