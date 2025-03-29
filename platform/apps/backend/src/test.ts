let BACKEND_API_HOST = "http://localhost:4444";

const response1 = await fetch(`${BACKEND_API_HOST}/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Create a hello world telegram bot",
    telegramBotToken: "7380687946:AAHZpeSObIem-uGFA7rrgzzxgR1bh4Wl4hY",
    userId: "123",
    useStaging: false,
    useMockedAgent: true,
    runMode: "telegram",
    clientSource: "slack",
  }),
});

if (!response1.ok) {
  console.error(response1.statusText);
  process.exit(1);
}

const data1 = await response1.json();
console.log(data1);

if (data1.error) {
  console.error(data1.error);
  process.exit(1);
}

const response2 = await fetch(`${BACKEND_API_HOST}/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "build it",
    telegramBotToken: "7380687946:AAHZpeSObIem-uGFA7rrgzzxgR1bh4Wl4hY",
    userId: "123",
    useStaging: false,
    useMockedAgent: true,
    botId: data1.newBot.id,
    runMode: "telegram",
    clientSource: "slack",
  }),
});

if (!response2.ok) {
  console.error(response2.statusText);
  process.exit(1);
}

const data2 = await response2.json();
console.log(data2);

if (data2.error) {
  console.error(data2.error);
  process.exit(1);
}
