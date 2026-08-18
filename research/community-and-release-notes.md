# Community and Release Notes

## Community feedback as product evidence

A public Zapier Community discussion emphasizes that a useful personal assistant should make data handling, retention and third-party sharing understandable, prevent accidental sharing of passwords or internal records, and allow verifiable deletion. This is one community viewpoint, not a technical standard; it supports the MVP choice to surface data destination, permission and retention information in the UI rather than treating automation as opaque. [1]

## Google Play implications

Google Play's User Data policy requires accurate disclosure of user-data access, collection, use, handling and sharing; it also requires runtime permission requests where Android supports them, security protections such as modern cryptography in transit, a valid privacy policy in the listing and app, Data safety disclosures, and account/data deletion when the app offers accounts. Because an assistant may process text, files, microphone input or connected-service data, the first Play Store submission must include a completed data inventory and must request device permissions only at the moment a user invokes the related capability. [2]

## MVP release decision

The first public build will minimize permissions: no contact, location, SMS, calendar, camera, accessibility-service or unrestricted file-system permission will be requested. Microphone and media/file access will be optional feature-level requests. The app will include a privacy screen, local-history deletion, connector revocation UI, and placeholders for the required public privacy-policy endpoint before store submission.

## References

[1] [Zapier Community, “If You Could Build Your Own AI Assistant, What Would It Do?”](https://community.zapier.com/general-discussion-13/if-you-could-build-your-own-ai-assistant-what-would-it-do-52372)

[2] [Google Play Console Help, User Data Policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
