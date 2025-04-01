# app.build Backend

To work on the app.build backend, you need to set up a `.env.local` file in `platform/apps/backend`.

This `.env.local` needs a bunch of things, one of which is a Postgres `DATABASE_URL`connection string. Simply create a branch off of `main` in the [chatbots-platform project in Neon](https://console.neon.tech/app/projects/damp-surf-76179452). Take the `DATABASE_URL` for this branch, and put it in your `apps/backend/.env.local`. The rest of the variables should match production.

Then, to start the agent server locally just do `cd mocked-agent/` and `bun run dev`. This starts a mocked agent server on `0.0.0.0:5575`.

Finally, to run the platform backend locally, just run `bun run dev` from `platform/apps/backend`.