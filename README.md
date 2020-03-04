# Telegram channels' posts aggregator

🚧 ...Work in progress... 🚧

📩 📭 Aggregates posts from your telegram channel(s) assigned to your bot(s), filters the data, saves it into MongoDB & renders the data using React (see the **client** folder).

# Features & Technologies 💡

- [telegraf.js](https://telegraf.js.org/#/?id=features)
- [cheerio](https://www.npmjs.com/package/cheerio)
- [sync-request](https://www.npmjs.com/package/sync-request) but consider [then-request](https://github.com/then/then-request)
- [normalize-url](https://www.npmjs.com/package/normalize-url)
- @multifeed_edge_bot to aggregate and [redirect](https://github.com/galakhov/tg-channelposts-aggregator/tree/master/server) messages from a set of channels
- [ElasticSearch](https://www.elastic.co)
- [monstache](https://rwynn.github.io/monstache-site/)

# Installation

See [server/README.md](server/README.md) & [client/README.md](client/README.md) files for the detailed installation steps.

# The big picture of CI/CD

<center><img src="./_manual/images/05-Deployment.jpg" alt="CI and the architecture" width="600"></center>
<sub><strong>Figure 1. CI/CD step-by-step.</strong></sub>

## The Set-Up

My set-up of the self-hosted Drone CI platform is inspired by the [post](https://habr.com/ru/post/476368/) that describes CI/CD using GitHub Actions and some bash scripts on a VPS. However, I'm using Docker Hub's [automated builds](https://docs.docker.com/docker-hub/builds/) instead of the step 5 described in the figure 1 and Docker Swarm for the orchestration on the VPS.

## Posts with similar set-ups:

- [Setup Gitea and Drone on Docker 2020 Edition](https://blog.ruanbekker.com/blog/2020/02/04/setup-gitea-and-drone-on-docker-2020-edition/) / [Source code 1](https://gist.github.com/ruanbekker/27d2cb2e3f4194ee5cfe2bcdc9c4bf52) / [Source code 2](https://gist.github.com/ruanbekker/3847bbf1b961efc568b93ccbf5c6f9f6)
- [Using Drone CI to Build a Jekyll Site and Deploy to Docker Swarm](https://blog.ruanbekker.com/blog/2019/04/23/using-drone-ci-to-build-a-jekyll-site-and-deploy-to-docker-swarm/)
- [Setup a Drone CICD Environment on Docker With Letsencrypt](https://blog.ruanbekker.com/blog/2019/04/18/setup-a-drone-cicd-environment-on-docker-with-letsencrypt/)
- [Self Hosted Git and CICD Platform with Gitea and Drone on Docker](https://sysadmins.co.za/self-hosted-git-and-cicd-platform-with-gitea-and-drone-on-docker/)

### Posts on Docker Swarm Clusters

[Create a Docker Swarm Cluster on DigitalOcean](https://lunar.computer/posts/docker-swarm-digitalocean/)

### Posts on Traefik v2

[Traefik v2 with the static and dynamic configuration](https://dev.to/nflamel/how-to-have-https-on-development-with-docker-traefik-v2-and-mkcert-2jh3)

### Posts on and insights to Drone CI

Sample of a [.drone.yml configuration](https://gist.github.com/anson-vandoren/03234a231e9af533aa0bad9ff2d2b58f) file.

Docs of the Drone [plugin that executes commands on a remote server via SSH](http://plugins.drone.io/appleboy/drone-ssh/) / [Drone SSH on GitHub](https://github.com/appleboy/drone-ssh):

- [How to set environment variables for a drone plugin](https://github.com/appleboy/drone-ssh/issues/130)
- [Drone SSH environment variables](https://github.com/appleboy/drone-ssh/blob/master/main.go)
- [Drone SSH: usage example](https://git.b12f.io/hornet.garden/hornet.garden/src/commit/afe6557279ddc9b53c2be882797bae36ea185d08/.drone.yml?lang=lv-LV)

[The Drone Telegram Plugin](http://plugins.drone.io/appleboy/drone-telegram/) to send notifications about the build status to a chat in Telegram:

- [Get the token — app's api_hash — from the API development tools](https://my.telegram.org/apps)
- Chat ID for the 'to' parameter can be obtained by starting the @userinfobot in Telegram.
- [Create and start your bot](https://angristan.xyz/2018/08/setup-telegram-bot-for-drone-ci-cd-builds/)

# Credits 🙏

Inspired by and based on this [repo](https://github.com/foreseaz/tg-channel-dashboard).
