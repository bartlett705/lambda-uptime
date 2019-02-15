## Get uptime updates in discord

### Usage:

- Run [this uptime service](https://github.com/bartlett605/uptime) on the box you want monitored.
- Set up a Lambda with the environment variables expected in the `index.js` handler.
- Upload the handler. If your AWS CLI is configured, you can use `scripts/deploy.sh function-name`
- Confgure the lambda to trigger regularly using a Cloudwatch Event or other event source.
