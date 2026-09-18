# Protected lesson media

Place your own MP4 or WebM recordings here, for example `lesson-01.mp4`.
In Owner dashboard > Programme > Lesson, use `media:lesson-01.mp4` as the video value.
Use filenames containing only letters, numbers, hyphens and underscores, followed by `.mp4` or `.webm`.

The files are outside the public website. `/api/media/:lessonId` checks the signed-in learner's course access before serving a file. A lesson explicitly marked as a free preview is publicly accessible.

An authorised viewer can still record or download media. This access check is not DRM. For high-volume streaming, configure a specialist video host with signed playback and appropriate domain restrictions. A normal external URL is not made private by this application.

Back up this directory separately from the SQLite database. Do not put secrets here.
