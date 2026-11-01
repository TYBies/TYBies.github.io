# One-app release-check sample

A deliberately small Python standard-library app, not production infrastructure.
Requires Python 3.10+ and Docker with Compose. Run from this directory:

```sh
python3 -m unittest -v
python3 verify.py
```

The verifier builds an image, runs two contract tests, starts v1, proves an intentionally broken candidate fails, confirms v1 remains healthy, tests and releases v2, then rolls back to v1 and checks HTTP health again. It always removes only its uniquely named Compose project's containers/network and locally built image. No host mounts, credentials or cloud resources; an automatically selected loopback port avoids fixed-port conflicts. It may download the Python base image. Base-image tags are mutable: pin an approved digest for a real delivery pipeline.

`APP_VERSION` selects a tiny versioned response, not separate application binaries. This exercises the release gate and runtime configuration rollback; it is not an immutable-image rollback, database migration, zero-downtime deployment or production-readiness test. The app uses Python's demonstration HTTP server. The intentional failure is successful rejection, not a passing test suite. The same test command can be a GitHub Actions job; no workflow is included or claimed to have run.

For a real pilot: agree one app, an isolated staging target, CI permissions, artifact versioning, acceptance checks and rollback limits before implementation. Database/data recovery and secrets provisioning need separate design. No uptime, security certification or customer results are claimed.
