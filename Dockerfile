FROM node:12
MAINTAINER <lucknell3@gmail.com>
RUN mkdir -p /src/bot/
WORKDIR /src/bot
COPY . /src/bot
RUN npm install gtts discord.js @discordjs/opus
RUN apt update
RUN apt install -y ffmpeg
CMD ["node", "it-ezz.js"]
