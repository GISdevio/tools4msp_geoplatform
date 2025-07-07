# Users

The routines in this directory handle users (*profiles*) download and upload.

> [!IMPORTANT]
> Since some users do not have an email, it is necessary to set the environment variable `ACCOUNT_EMAIL_REQUIRED` to `False` in the new platform

During the migration, the following behaviors apply:

- some users of the legacy platform are returned by the API but not by the GUI -> they are skipped
- some users of the legacy platform have the same email, which is not possible with the new platform -> they are set without email

## Reports and data

Download and upload reports are saved in the `/data/users` directory:

- `/download-report` contains reports of the download processes
- `/data.json` contains the downloaded data
- `/download-state.json` marks all the users already downloaded so that multiple download processes skip them
- `/creation-report` contains reports of the upload processes
- `/creation-state.json` marks all the users already uploaded so that multiple upload processes skip them
