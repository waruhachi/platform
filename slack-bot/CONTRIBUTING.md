To do local development work on the Slack Bot, you have to:

1. Set up a `.env` file from `.env.example`
2. If you need to connect to the remote backend, make this change in `index.ts`:

```
let BACKEND_API_HOST: string;
if (process.env.NODE_ENV === "production") {
  BACKEND_API_HOST = "https://platform-muddy-meadow-938.fly.dev";
} else {
  BACKEND_API_HOST = "https://platform-muddy-meadow-938.fly.dev";
  // BACKEND_API_HOST = "http://0.0.0.0:4444";
}
```

3. Please coordinate with others on Slack since only one person can be running the Slack bot at a given time
4. Run `bun run dev`
