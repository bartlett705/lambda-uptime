const fetch = require("node-fetch");
const dotenv = require("dotenv");

/** expect discord config to be in a .env file for local testing */
if (!process.env.PRODUCTION) {
  dotenv.config({});
}

/**
 * It's probably ridiculous to instantiate a class to call one method, once...
 * but I initially wrote this for some long-lived TypeScript services, so 🤷‍♂
 */
class Discord {
  constructor(discordToken, channelID, defaultMsg, onError, onSuccess) {
    if (!discordToken || !channelID) {
      throw new Error("Discord config missing");
    }
    // This is so much more terse in TS 😭
    this.channelID = channelID;
    this.discordToken = discordToken;
    this.defaultMsg = defaultMsg;
    this.onError = onError;
    this.onSuccess = onSuccess;
  }

  async postMessage(msg) {
    try {
      const res = await fetch(
        `https://discordapp.com/api/webhooks/${this.channelID}/${
          this.discordToken
        }`,
        {
          body: JSON.stringify({
            ...this.defaultMsg,
            ...msg
          }),
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "lambda-healthcheck v0.2"
          },
          method: "POST"
        }
      );
      if (res.status <= 204) {
        this.onSuccess("Done!");
      } else {
        throw new Error(`Got status code from discord: ${res.status}`);
      }
    } catch (err) {
      console.error("Had trouble posting webhook to discord :/");
      this.onError(err);
    }
  }
}

exports.handler = async (_, __, callback) => {
  const discord = new Discord(
    process.env.DISCORD_TOKEN,
    process.env.DISCORD_CHANNEL,
    {
      username: "Health Check",
      avatar_url: "https://mosey.systems/red-cross.jpg"
    },
    process.env.PRODUCTION ? (d) => callback(null, d) : console.error,
    console.info
  );

  let content = "Network error reaching " + process.env.ENDPOINT;
  try {
    const res = await fetch(process.env.ENDPOINT, {
      headers: {
        "User-Agent": "lambda-healthcheck v0.2"
      }
    });
    if (res.status === 200) {
      const body = await res.text();
      content = `${process.env.SITE_NAME} uptime: ${body.split("|")[1]}`;
    } else {
      content = `Received status code ${res.status} from ${
        process.env.ENDPOINT
      }`;
    }
  } catch (err) {
    content = err.toString();
  }

  console.log("Posting to discord: ", content);
  await discord.postMessage({ content });
};

// for testing with or without PRODUCTION = true
// exports.handler({ foo: "dill!" }, null, (a, b) => console.error(b));
