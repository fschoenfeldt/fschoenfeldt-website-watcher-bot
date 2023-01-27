const TelegramBot = require("node-telegram-bot-api");
const debug = require("debug")("bot");
const https = require("https");
const { errorMessage, serverIsBackOnlineMessage } = require("./lib/messages");

// Replace with your own Telegram bot token
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ONE_HOUR = 1000 * 60 * 60;
const bot = new TelegramBot(TOKEN, { polling: true });

// split env var SERVER_URLS into array
let servers = process.env.SERVER_URLS.split(";").map((url) => {
  return {
    url,
    isDown: false,
    setDown: (to) => {
      this.isDown = to;
    },
    onResponse: (res) => handleResponse(res, this),
    onError: (err) => handleError(err, this),
  };
});

// Function to check if the server is reachable
function checkServer(servers) {
  return servers.map(check);
}

/**
 * tries to reach the server and sends a message to the Telegram chat in case of success or failure
 * @param {String} serverUrl url of the server to check
 */
const check = (server) => {
  console.debug("before");
  console.debug(server);
  const url = server.url;
  debug(`checking server 
  ${JSON.stringify(server, null, 2)}`);

  https.get(url, server.onResponse).on("error", server.onError);

  console.debug("after");
  console.debug(server);
  return server;
};

const handleResponse = (res, server) => {
  if (res.statusCode === 200) {
    server.setDown(false);

    if (server.isDown) {
      bot.sendMessage(CHAT_ID, serverIsBackOnlineMessage(server.url));
    } else {
      debug(`Server ${server.url} is up and running!`);
    }
  } else {
    handleError(`no error given`, server);
  }

  return server;
};

const handleError = (err, server) => {
  console.debug("server?");
  console.debug(server);
  server.setDown(true);
  if (server.isDown) {
    debug(`Server ${server.url} is still down!`);
  } else {
    debug(`⚠️ Server ${server.url} is down!`);
    bot.sendMessage(CHAT_ID, errorMessage(err, server.url));
  }
  debug(`after handleError`);
  debug(server);

  return server;
};

// Schedule the server check to run every hour
setInterval(() => {
  servers = checkServer(servers);
}, 5 * 1000);
